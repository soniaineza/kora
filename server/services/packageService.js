'use strict';

/**
 * Package & exam business logic (moved from the original monolith so the
 * package activation, lookup and exam-session flows live in a service rather
 * than in route handlers).
 */

const ApiError = require('../utils/ApiError');
const { config } = require('../config/env');
const { getSupabaseAdmin } = require('../database/supabase');

const PLAN_MAP = {
  STARTER: { days: 3, exams: 10, amountRwf: 500, unlimited: false },
  BASIC: { days: 5, exams: 15, amountRwf: 1000, unlimited: false },
  STANDARD: { days: 7, exams: 20, amountRwf: 1500, unlimited: false },
  MASTER: { days: 10, exams: 20, amountRwf: 2000, unlimited: false },
  PREMIUM: { days: 15, exams: 25, amountRwf: 3000, unlimited: false },
  PRO: { days: 30, exams: 50, amountRwf: 5000, unlimited: false },
  UNLIMITED: { days: 45, exams: 100, amountRwf: 7000, unlimited: false },
};

function getPlan(packageKey) {
  const key = String(packageKey || '').toUpperCase();
  const plan = PLAN_MAP[key];
  if (!plan) return null;
  return { key, ...plan };
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

async function activatePackage(paymentReference) {
  const { data: pkg, error: readError } = await getSupabaseAdmin()
    .from('user_packages')
    .select('*')
    .eq('payment_reference', paymentReference)
    .limit(1)
    .maybeSingle();

  if (readError) throw readError;
  if (!pkg) {
    throw ApiError.notFound('Payment reference not found');
  }

  const plan = getPlan(pkg.package_key);
  if (!plan) {
    throw ApiError.badRequest('Unknown package');
  }

  const now = new Date();
  const expiresAt = plan.days ? addDays(now, plan.days).toISOString() : null;

  const { data, error } = await getSupabaseAdmin()
    .from('user_packages')
    .update({
      status: 'active',
      activated_at: now.toISOString(),
      expires_at: expiresAt,
      total_attempts: plan.unlimited ? null : plan.exams,
      remaining_attempts: plan.unlimited ? null : plan.exams,
      unlimited: plan.unlimited,
      amount_rwf: plan.amountRwf,
    })
    .eq('id', pkg.id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function findActivePackage(phone, planKey) {
  const nowIso = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from('user_packages')
    .select('*')
    .eq('phone', phone)
    .eq('package_key', planKey)
    .eq('status', 'active')
    .or(`expires_at.gt.${nowIso},expires_at.is.null`)
    .order('activated_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0] || null;
}

async function createExamSession({ phone, planKey, userPackage }) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.examDurationSeconds * 1000);
  const sessionId = `ex_${phone}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`.replace(
    /[^0-9a-zA-Z_-]/g,
    ''
  );

  if (!userPackage.unlimited) {
    const remaining = Number(userPackage.remaining_attempts || 0);
    if (remaining <= 0) {
      throw ApiError.forbidden('No remaining attempts for this package');
    }

    const { error: attemptError } = await getSupabaseAdmin()
      .from('user_packages')
      .update({ remaining_attempts: remaining - 1 })
      .eq('id', userPackage.id)
      .eq('remaining_attempts', remaining);

    if (attemptError) throw attemptError;
  }

  const { data: session, error: sessionError } = await getSupabaseAdmin()
    .from('exam_sessions')
    .insert({
      id: sessionId,
      phone,
      plan: planKey,
      status: 'active',
      expires_at: expiresAt.toISOString(),
      user_package_id: userPackage.id,
      duration_seconds: config.examDurationSeconds,
    })
    .select('*')
    .single();

  if (sessionError) throw sessionError;

  await getSupabaseAdmin()
    .from('attempt_history')
    .insert({
      user_id: phone,
      user_package_id: userPackage.id,
      exam_session_id: sessionId,
      plan: planKey,
      attempt_consumed: true,
    });

  return session;
}

module.exports = { PLAN_MAP, getPlan, addDays, activatePackage, findActivePackage, createExamSession };
