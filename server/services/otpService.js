'use strict';

/**
 * OTP service.
 *
 * Responsibilities:
 *   - generate a 6-digit code (fixed dev code outside production),
 *   - hash it (HMAC-SHA256) before storing,
 *   - expire codes after OTP_TTL_MS (default 5 minutes),
 *   - auto-delete expired codes,
 *   - enforce a 60s resend interval per phone,
 *   - block reuse (verified codes),
 *   - cap verification attempts (default 5),
 *   - deliver the code via Africa's Talking SMS.
 */

const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { config } = require('../config/env');
const { isValidRwandaPhone, toLocalKey } = require('../utils/phone');
const { hashOtp, otpMatches, generateOtp } = require('../utils/crypto');
const otpModel = require('../models/otpModel');
const smsService = require('./smsService');
const userService = require('./userService');
const authService = require('./authService');

/**
 * Generate + persist + deliver an OTP for a phone number.
 *
 * @param {string} phone
 * @returns {Promise<{phone: string, expiresAt: string, devCode?: string, sms?: Object}>}
 */
async function sendOtp(phone) {
  const normalized = toLocalKey(phone);
  if (!isValidRwandaPhone(normalized)) {
    throw ApiError.badRequest('phone must be a valid Rwandan mobile number');
  }

  await otpModel.deleteExpired();

  const existing = await otpModel.findLatest(normalized);
  if (existing && !existing.verified) {
    const elapsed = Date.now() - new Date(existing.created_at).getTime();
    if (elapsed < config.otp.resendIntervalMs) {
      const waitSeconds = Math.ceil((config.otp.resendIntervalMs - elapsed) / 1000);
      throw ApiError.tooManyRequests(
        `Please wait ${waitSeconds}s before requesting a new code`
      );
    }
  }

  const code = config.isProduction ? generateOtp() : config.otp.devCode;
  const otpHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + config.otp.ttlMs).toISOString();

  await otpModel.create({ phone: normalized, otpHash, expiresAt });

  let sms = null;
  if (config.isProduction) {
    sms = await smsService.sendOTP(normalized, code);
    if (!sms.success) {
      logger.error('OTP delivery failed', { phone: normalized, error: sms.error });
      throw ApiError.badGateway('Failed to deliver the verification code. Please try again.');
    }
  }

  logger.info('OTP requested', { phone: normalized });

  return {
    phone: normalized,
    expiresAt,
    ...(config.isProduction ? {} : { devCode: code }),
    ...(sms ? { sms } : {}),
  };
}

/**
 * Verify a submitted OTP. On success: marks the code used, ensures the user
 * exists, issues a JWT and returns the user profile.
 *
 * @param {string} phone
 * @param {string} code 6-digit code
 * @param {Object} [options]
 * @param {string} [options.fullName] optional name captured for auto-provisioning
 * @returns {Promise<{token: string, user: Object, phone: string}>}
 */
async function verifyOtp(phone, code, { fullName } = {}) {
  const normalized = toLocalKey(phone);
  if (!isValidRwandaPhone(normalized)) {
    throw ApiError.badRequest('phone must be a valid Rwandan mobile number');
  }
  if (!/^\d{6}$/.test(String(code || '').trim())) {
    throw ApiError.badRequest('code must be exactly 6 digits');
  }

  await otpModel.deleteExpired();

  const record = await otpModel.findLatest(normalized);
  if (!record) {
    throw ApiError.badRequest('Verification code is incorrect or has expired');
  }
  if (record.verified) {
    throw ApiError.badRequest('This code has already been used');
  }
  if (record.attempts >= config.otp.maxAttempts) {
    await otpModel.remove(record.id);
    throw ApiError.tooManyRequests('Too many attempts. Request a new code.');
  }

  if (!otpMatches(String(code).trim(), record.otp_hash)) {
    const attempts = record.attempts + 1;
    await otpModel.incrementAttempts(record.id, attempts);
    logger.warn('OTP verification failed', { phone: normalized, attempts });
    if (attempts >= config.otp.maxAttempts) {
      await otpModel.remove(record.id);
      throw ApiError.tooManyRequests('Too many attempts. Request a new code.');
    }
    throw ApiError.unauthorized('Verification code is incorrect');
  }

  await otpModel.markVerified(record.id);

  const user = await userService.findOrCreateUser(normalized, { fullName });
  const token = authService.issueToken(user);

  logger.info('OTP verified', { phone: normalized, userId: user.id });
  return { token, user, phone: normalized };
}

module.exports = { sendOtp, verifyOtp };
