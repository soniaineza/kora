'use strict';

/**
 * Rate limiting.
 *
 * Two layers:
 *   1. A global per-IP limiter across /api routes.
 *   2. Tighter per-IP limiters for OTP endpoints (the per-phone 60s window is
 *      enforced separately inside the OTP service using the database).
 */

const rateLimit = require('express-rate-limit');
const { config } = require('../config/env');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_GLOBAL || 1000),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests. Please try again later.' },
  ...(config.isTest ? { validate: false } : {}),
});

const otpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_OTP_SEND || 10),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'Too many OTP requests. Please try again later.' },
  ...(config.isTest ? { validate: false } : {}),
});

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_OTP_VERIFY || 30),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'Too many verification attempts. Please try again later.' },
  ...(config.isTest ? { validate: false } : {}),
});

module.exports = { globalLimiter, otpSendLimiter, otpVerifyLimiter };
