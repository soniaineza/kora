'use strict';

/**
 * Auth service. Issues and verifies JWTs for authenticated users.
 */

const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const ApiError = require('../utils/ApiError');

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

module.exports = { issueToken, verifyToken };
