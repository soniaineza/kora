'use strict';

/**
 * Payment Controller
 * Handles manual order creation, order status, history, and user dashboard.
 */

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { validate } = require('../middleware/validate');
const v = require('../utils/validators');
const paymentService = require('../services/paymentService');
const packageService = require('../services/packageService');

/**
 * POST /api/payments/initiate
 * Place a manual order for a package. Payment is made offline (MTN/Airtel
 * MoMo, bank, etc.) and an admin activates the order afterwards.
 * Body: { packageKey }
 */
const initiatePayment = asyncHandler(async (req, res) => {
  const { packageKey } = req.body;
  const userId = req.auth?.userId;
  const phone = req.auth?.phone;

  if (!userId) throw ApiError.unauthorized('Missing user in token');

  const { txRef } = await paymentService.createOrder({
    userId,
    packageKey,
    phoneNumber: phone,
  });

  logger.info('Order placed', { txRef, userId, packageKey });
  res.status(200).json({
    ok: true,
    orderId: txRef,
    txRef,
    status: 'pending',
  });
});

/**
 * POST /api/payments/paypack/start
 * Start a Paypack mobile-money payment for a package. The user receives a MoMo
 * prompt on their phone; the package is activated automatically via webhook.
 * Body: { packageKey, phone }
 */
const startPaypackPayment = asyncHandler(async (req, res) => {
  const { packageKey, phone } = req.body;
  const userId = req.auth?.userId;
  const accountPhone = req.auth?.phone;

  if (!userId) throw ApiError.unauthorized('Missing user in token');

  const payPhone = phone || accountPhone;
  if (!payPhone) throw ApiError.badRequest('phone is required');

  const { txRef, providerRef } = await paymentService.createPaypackOrder({
    userId,
    packageKey,
    phoneNumber: payPhone,
    accountPhone,
  });

  logger.info('Paypack payment started', { txRef, userId, packageKey, providerRef });
  res.status(200).json({
    ok: true,
    orderId: txRef,
    txRef,
    providerRef,
    status: 'pending',
  });
});

/**
 * GET /api/payments/order/:txRef
 * Get the current status of a manual order (pending -> active once admin
 * activates it).
 */
const getOrderStatus = asyncHandler(async (req, res) => {
  const { txRef } = req.params;
  const userId = req.auth?.userId;

  if (!txRef) throw ApiError.badRequest('Missing order reference');

  const status = await paymentService.getOrderStatus(txRef);
  if (!status) throw ApiError.notFound('Order not found');

  // Only the owner may check their own order.
  if (userId && status.userId && status.userId !== userId) {
    throw ApiError.forbidden('You are not allowed to view this order');
  }

  res.json({ ok: true, order: status });
});

/**
 * GET /api/payments/history
 * Get user's order/payment history.
 */
const getPaymentHistory = asyncHandler(async (req, res) => {
  const userId = req.auth.userId;
  const { limit = 20, offset = 0 } = req.query;

  const history = await paymentService.getUserPaymentHistory(userId, {
    limit: Number(limit),
    offset: Number(offset),
  });

  res.json({ ok: true, history });
});

/**
 * GET /api/payments/subscription
 * Get user's active subscription.
 */
const getActiveSubscription = asyncHandler(async (req, res) => {
  const userId = req.auth.userId;
  const subscription = await paymentService.getUserActiveSubscription(userId);

  if (!subscription) {
    return res.json({ ok: true, active: false });
  }

  res.json({ ok: true, active: true, subscription });
});

/**
 * GET /api/payments/subscriptions
 * Get user's subscription history.
 */
const getSubscriptions = asyncHandler(async (req, res) => {
  const userId = req.auth.userId;
  const { limit = 20, offset = 0 } = req.query;

  const subscriptions = await paymentService.getUserSubscriptions(userId, {
    limit: Number(limit),
    offset: Number(offset),
  });

  res.json({ ok: true, subscriptions });
});

/**
 * GET /api/payments/packages
 * Get available packages.
 */
const getPackages = asyncHandler(async (req, res) => {
  const packages = Object.entries(packageService.PLAN_MAP).map(([key, plan]) => ({
    key,
    name: key.charAt(0) + key.slice(1).toLowerCase(),
    ...plan,
  }));

  res.json({ ok: true, packages });
});

module.exports = {
  initiatePayment,
  startPaypackPayment,
  getOrderStatus,
  getPaymentHistory,
  getActiveSubscription,
  getSubscriptions,
  getPackages,
};