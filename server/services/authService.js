'use strict';

/**
 * Auth service. Issues and verifies JWTs for authenticated users.
 */

const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const ApiError = require('../utils/ApiError');
const { hashPassword, verifyPassword } = require('../utils/crypto');
const { isValidRwandaPhone, toLocalKey } = require('../utils/phone');
const userModel = require('../models/userModel');

/**
 * @param {Object} user user row (id, phone)
 * @returns {string} signed JWT
 */
function issueToken(user) {
  const payload = {
    sub: user.id,
    userId: user.id,
    phone: user.phone,
  };
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  });
}

/**
 * @param {string} token
 * @returns {Object} decoded payload
 * @throws {ApiError} 401 when the token is missing/invalid/expired
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') {
    throw ApiError.unauthorized('Missing authentication token');
  }
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (_err) {
    throw ApiError.unauthorized('Invalid or expired token');
  }
}

/**
 * Register a new account with phone + password (no OTP).
 * If the phone belongs to an OTP-era account without a password, the account
 * is upgraded with the password instead of rejecting the registration.
 * @returns {Promise<{token: string, user: Object}>}
 */
async function register({ phone, password, fullName, email }) {
  const normalized = toLocalKey(phone);
  if (!isValidRwandaPhone(normalized)) {
    throw ApiError.badRequest('phone must be a valid Rwandan mobile number');
  }

  const passwordHash = await hashPassword(password);
  let user = await userModel.findByPhone(normalized);

  if (user) {
    if (user.password_hash) {
      throw ApiError.conflict('An account with this phone number already exists. Please log in.');
    }
    // OTP-era user without a password — upgrade in place.
    user = await userModel.updatePassword(user.id, passwordHash);
    if (fullName && !user.full_name) user = await userModel.updateFullName(user.id, fullName);
    if (email && !user.email) user = await userModel.updateEmail(user.id, email);
  } else {
    user = await userModel.create({ phone: normalized, fullName, passwordHash, email });
  }

  return { token: issueToken(user), user };
}

/**
 * Log in with phone (or email) + password.
 * @returns {Promise<{token: string, user: Object}>}
 */
async function login({ identifier, password }) {
  if (!identifier || !password) {
    throw ApiError.unauthorized('Phone/email and password are required');
  }

  const idText = String(identifier).trim();
  const user = idText.includes('@')
    ? await userModel.findByEmail(idText.toLowerCase())
    : await userModel.findByPhone(toLocalKey(idText));

  if (!user || !user.password_hash) {
    throw ApiError.unauthorized('Invalid phone/email or password');
  }
  const ok = await verifyPassword(String(password), user.password_hash);
  if (!ok) {
    throw ApiError.unauthorized('Invalid phone/email or password');
  }

  return { token: issueToken(user), user };
}

module.exports = { issueToken, verifyToken, register, login };
