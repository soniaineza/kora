'use strict';

/**
 * Auth controller: OTP send + verify.
 */

const asyncHandler = require('../utils/asyncHandler');
const otpService = require('../services/otpService');
const authService = require('../services/authService');
const logger = require('../utils/logger');

const sendOtp = asyncHandler(async (req, res) => {
  const { phone, fullName } = req.body;
  const result = await otpService.sendOtp(phone, fullName);
  logger.info('OTP send success', { phone });
  res.status(200).json({ ok: true, message: 'Verification code sent', ...result });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, code, fullName } = req.body;
  const { token, user, phone: normalizedPhone } = await otpService.verifyOtp(phone, code, {
    fullName,
  });
  logger.info('OTP verify success', { phone: normalizedPhone, userId: user.id });
  res.status(200).json({ ok: true, token, phone: normalizedPhone, user });
});

const register = asyncHandler(async (req, res) => {
  const { phone, password, fullName, email } = req.body;
  const { token, user } = await authService.register({ phone, password, fullName, email });
  logger.info('User registered with password', { userId: user.id });
  res.status(201).json({ ok: true, token, user });
});

const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const { token, user } = await authService.login({ identifier, password });
  logger.info('User logged in with password', { userId: user.id });
  res.json({ ok: true, token, user });
});

module.exports = { sendOtp, verifyOtp, register, login };
