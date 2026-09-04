'use strict';
const express = require('express');
const router = express.Router();

const { validate } = require('../middleware/validate');
const { otpSendLimiter, otpVerifyLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');
const v = require('../utils/validators');

router.post(
  '/send-otp',
  otpSendLimiter,
  validate({
    body: {
      phone: v.phone,
      fullName: v.stringOptional,
    },
  }),
  authController.sendOtp
);

router.post(
  '/verify-otp',
  otpVerifyLimiter,
  validate({
    body: {
      phone: v.phone,
      code: v.otp,
      fullName: v.stringOptional,
    },
  }),
  authController.verifyOtp
);

// Password auth (no OTP required)
router.post(
  '/register',
  validate({
    body: {
      phone: v.phone,
      password: v.password,
      fullName: v.stringField,
      email: v.emailOptional,
    },
  }),
  authController.register
);

router.post(
  '/login',
  validate({
    body: {
      identifier: v.stringField,
      password: v.stringField,
    },
  }),
  authController.login
);

module.exports = router;
