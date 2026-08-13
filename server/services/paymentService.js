'use strict';

/**
 * Payment Service
 * Core business logic for manual (offline) orders and package activation.
 *
 * Buying a package no longer calls any external payment provider. A user
 * places an order which is stored as pending; an admin activates it manually
 * after receiving payment outside the platform.
 */

const { getSupabaseAdmin } = require('../database/supabase');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const packageService = require('./packageService');
const notificationService = require('./notificationService');
const paypackService = require('./paypackService');
const { toLocalKey } = require('../utils/phone');

const PLAN_DAYS = {
  STARTER: 3,
  BASIC: 5,
  STANDARD: 7,
  MASTER: 10,
  PREMIUM: 15,
  PRO: 30,
  UNLIMITED: 45,
};

function calculateExpiry(packageKey) {
  const days = PLAN_DAYS[packageKey?.toUpperCase()];
  if (!days) return null;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry.toISOString();
}

function makeTxRef() {
  return `ord_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Create a pending manual order (transaction + activation record).
 */
async function createOrder({ userId, packageKey, amountRwf, phoneNumber, email, paymentMethod = 'manual' }) {
  const plan = packageService.getPlan(packageKey);
  if (!plan) throw ApiError.badRequest('Invalid package');

  const txRef = makeTxRef();
  const normalizedPhone = phoneNumber;

  const { data: transaction, error: txError } = await getSupabaseAdmin()
    .from('transactions')
    .insert({
      user_id: userId,
      package_key: plan.key,
      tx_ref: txRef,
      payment_provider: 'manual',
      payment_method: paymentMethod,
      amount_rwf: plan.amountRwf,
      currency: 'RWF',
      phone_number: normalizedPhone,
      email: email || `${normalizedPhone}@kora.rw`,
      status: 'pending',
      verified: false,
      webhook_received: false,
    })
    .select('*')
    .single();
  if (txError) throw txError;

  // Pending activation record — the exam gate reads this table, so a pending
  // row must exist before an admin activates the order.
  const { error: pkgError } = await getSupabaseAdmin()
    .from('user_packages')
    .insert({
      id: txRef,
      phone: normalizedPhone,
      package_key: plan.key,
      amount_rwf: plan.amountRwf,
      status: 'pending',
      payment_reference: txRef,
      payment_method: 'manual',
    });
  if (pkgError) throw pkgError;

  logger.info('Manual order created', { txRef, userId, packageKey: plan.key });
  return { txRef, transaction };
}

/**
 * Find a transaction by tx_ref.
 */
async function findTransactionByTxRef(txRef) {
  const { data, error } = await getSupabaseAdmin()
    .from('transactions')
    .select('*')
    .eq('tx_ref', txRef)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Find a transaction by its payment provider reference (Paypack ref).
 */
async function findTransactionByProviderReference(providerRef) {
  const { data, error } = await getSupabaseAdmin()
    .from('transactions')
    .select('*')
    .eq('provider_reference', providerRef)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Create a pending Paypack order: insert the transaction + activation record,
 * then initiate a cashin with Paypack. The returned Paypack reference is stored
 * on the transaction so the webhook can match it back.
 */
async function createPaypackOrder({ userId, packageKey, phoneNumber, accountPhone }) {
  const plan = packageService.getPlan(packageKey);
  if (!plan) throw ApiError.badRequest('Invalid package');

  const txRef = makeTxRef();
  const normalizedPhone = toLocalKey(phoneNumber);
  // The package belongs to the account's phone (what exam gating checks), even
  // when the customer pays from a different MoMo number.
  const accountPhoneKey = toLocalKey(accountPhone) || normalizedPhone;

  const { data: transaction, error: txError } = await getSupabaseAdmin()
    .from('transactions')
    .insert({
      user_id: userId,
      package_key: plan.key,
      tx_ref: txRef,
      payment_provider: 'paypack',
      payment_method: 'paypack_momo',
      amount_rwf: plan.amountRwf,
      currency: 'RWF',
      phone_number: normalizedPhone,
      email: `${normalizedPhone}@kora.rw`,
      status: 'pending',
      verified: false,
      webhook_received: false,
    })
    .select('*')
    .single();
  if (txError) throw txError;

  const { error: pkgError } = await getSupabaseAdmin()
    .from('user_packages')
    .insert({
      id: txRef,
      phone: accountPhoneKey,
      package_key: plan.key,
      amount_rwf: plan.amountRwf,
      status: 'pending',
      payment_reference: txRef,
      payment_method: 'paypack',
    });
  if (pkgError) throw pkgError;

  const cashin = await paypackService.requestCashin({
    amount: plan.amountRwf,
    number: normalizedPhone,
    idempotencyKey: txRef,
  });

  const providerRef = cashin?.ref;
  if (providerRef) {
    await updateTransactionVerification(txRef, {
      provider_reference: providerRef,
      payment_provider: 'paypack',
    });
  }

  logger.info('Paypack order created', { txRef, userId, packageKey: plan.key, providerRef });
  return { txRef, transaction, providerRef, cashin };
}

/**
 * Apply a successful Paypack webhook: mark the matching transaction successful
 * and activate the package. Idempotent — a second webhook for an already
 * successful order is a no-op.
 */
async function applyWebhookActivation({ providerRef, providerName = 'paypack' }) {
  const existing = await findTransactionByProviderReference(providerRef);
  if (!existing) {
    logger.warn('Webhook for unknown provider ref', { providerRef });
    return { duplicate: false, matched: false };
  }
  if (existing.status === 'successful') {
    logger.info('Order already successful via webhook', { txRef: existing.tx_ref });
    return { duplicate: true, matched: true, transaction: existing };
  }

  const transaction = await updateTransactionVerification(existing.tx_ref, {
    status: 'successful',
    verified: true,
    webhook_received: true,
    failure_reason: null,
    payment_provider: providerName,
  });

  const pkg = await packageService.activatePackage(existing.tx_ref);

  if (pkg?.phone) {
    await notificationService
      .notifyPaymentConfirmation(pkg.phone, {
        plan: pkg.package_key,
        amount: pkg.amount_rwf,
        reference: existing.tx_ref,
      })
      .catch((err) => logger.warn('Payment confirmation SMS failed', { error: err.message }));
  }

  logger.info('Order activated via webhook', { txRef: existing.tx_ref, providerRef });
  return { duplicate: false, matched: true, transaction, package: pkg };
}

/**
 * Mark a Paypack transaction as failed on a non-successful webhook event.
 */
async function failOrderFromWebhook({ providerRef, reason }) {
  const existing = await findTransactionByProviderReference(providerRef);
  if (!existing) {
    return { matched: false };
  }
  if (existing.status === 'successful') {
    return { duplicate: true, matched: true };
  }

  const transaction = await updateTransactionVerification(existing.tx_ref, {
    status: 'failed',
    verified: false,
    webhook_received: true,
    failure_reason: reason || 'Payment not completed',
  });

  const { error: pkgError } = await getSupabaseAdmin()
    .from('user_packages')
    .update({ status: 'failed' })
    .eq('payment_reference', existing.tx_ref);
  if (pkgError) throw pkgError;

  logger.warn('Order failed via webhook', { txRef: existing.tx_ref, reason });
  return { matched: true, transaction };
}

/**
 * Update transaction fields.
 */
async function updateTransactionVerification(txRef, updates) {
  const { data, error } = await getSupabaseAdmin()
    .from('transactions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('tx_ref', txRef)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/**
 * Activate a pending order manually (called by an admin after payment).
 */
async function applyManualActivation({ txRef, activatedBy }) {
  const existing = await findTransactionByTxRef(txRef);
  if (!existing) throw ApiError.notFound('Order not found');
  if (existing.status === 'successful') {
    logger.info('Order already activated', { txRef });
    return { duplicate: true, transaction: existing };
  }

  const transaction = await updateTransactionVerification(txRef, {
    status: 'successful',
    verified: true,
    webhook_received: false,
    failure_reason: null,
  });

  const pkg = await packageService.activatePackage(txRef);

  if (pkg?.phone) {
    await notificationService
      .notifyPaymentConfirmation(pkg.phone, {
        plan: pkg.package_key,
        amount: pkg.amount_rwf,
        reference: txRef,
      })
      .catch((err) => logger.warn('Payment confirmation SMS failed', { error: err.message }));
  }

  logger.info('Order activated manually', { txRef, activatedBy });
  return { transaction, package: pkg };
}

/**
 * Cancel / reject a pending order (admin).
 */
async function cancelOrder({ txRef, reason }) {
  const existing = await findTransactionByTxRef(txRef);
  if (!existing) throw ApiError.notFound('Order not found');
  if (existing.status === 'successful') {
    throw ApiError.conflict('Cannot cancel an already activated order');
  }

  const transaction = await updateTransactionVerification(txRef, {
    status: 'cancelled',
    verified: false,
    failure_reason: reason || 'Cancelled by admin',
  });

  const { error: pkgError } = await getSupabaseAdmin()
    .from('user_packages')
    .update({ status: 'cancelled' })
    .eq('payment_reference', txRef);
  if (pkgError) throw pkgError;

  logger.info('Order cancelled by admin', { txRef, activatedBy: reason });
  return { transaction };
}

/**
 * Get a user-facing order status.
 */
async function getOrderStatus(txRef) {
  const tx = await findTransactionByTxRef(txRef);
  if (!tx) return null;

  const { data: pkg } = await getSupabaseAdmin()
    .from('user_packages')
    .select('*')
    .eq('payment_reference', txRef)
    .limit(1)
    .maybeSingle();

  return {
    txRef,
    userId: tx.user_id,
    status: tx.status,
    packageKey: tx.package_key,
    amountRwf: tx.amount_rwf,
    phoneNumber: tx.phone_number,
    createdAt: tx.created_at,
    failureReason: tx.failure_reason || null,
    active: pkg?.status === 'active',
    package: pkg || null,
  };
}

/**
 * Get user's order/payment history.
 */
async function getUserPaymentHistory(userId, { limit = 20, offset = 0 } = {}) {
  const { data, error } = await getSupabaseAdmin()
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data || [];
}

/**
 * Get user's active subscription.
 */
async function getUserActiveSubscription(userId) {
  const { data, error } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('activated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

/**
 * Get user's subscription history.
 */
async function getUserSubscriptions(userId, { limit = 20, offset = 0 } = {}) {
  const { data, error } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('activated_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data || [];
}

module.exports = {
  createOrder,
  createPaypackOrder,
  findTransactionByTxRef,
  findTransactionByProviderReference,
  updateTransactionVerification,
  applyManualActivation,
  applyWebhookActivation,
  failOrderFromWebhook,
  cancelOrder,
  getOrderStatus,
  getUserPaymentHistory,
  getUserActiveSubscription,
  getUserSubscriptions,
  calculateExpiry,
};
