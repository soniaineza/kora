'use strict';

/**
 * OTP hashing helpers.
 *
 * OTPs are never stored in plain text. Each code is transformed with
 * HMAC-SHA256 keyed by a server secret (OTP_SECRET or JWT_SECRET). The 6-digit
 * space is intentionally small, so the keyed hash is used as a defence-in-depth
 * measure; real protection comes from expiry, attempt limits and rate limiting.
 */

const crypto = require('crypto');
const { promisify } = require('util');
const { config } = require('../config/env');

const scryptAsync = promisify(crypto.scrypt);

/**
 * Hash a password with a random salt using scrypt (Node built-in, no deps).
 * Stored format: `salt:derivedKey` (hex).
 * @param {string} password
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = await scryptAsync(String(password), salt, 64);
  return `${salt}:${derived.toString('hex')}`;
}

/**
 * Verify a password against a stored `salt:derivedKey` hash.
 * @param {string} password
 * @param {string} stored
 * @returns {Promise<boolean>}
 */
async function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string') return false;
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  try {
    const derived = await scryptAsync(String(password), salt, 64);
    const a = Buffer.from(key, 'hex');
    const b = derived;
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (_err) {
    return false;
  }
}

function hashOtp(code, secret = config.otp.secret) {
  return crypto.createHmac('sha256', secret).update(String(code)).digest('hex');
}

function otpMatches(code, expectedHash) {
  if (!expectedHash || typeof code !== 'string') return false;
  const actual = hashOtp(code);
  const a = Buffer.from(actual, 'utf8');
  const b = Buffer.from(expectedHash, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

module.exports = { hashOtp, otpMatches, generateOtp, hashPassword, verifyPassword };
