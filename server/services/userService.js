'use strict';

/**
 * User service. Creates the user automatically on first successful OTP
 * verification.
 */

const userModel = require('../models/userModel');
const { toLocalKey } = require('../utils/phone');

/**
 * Return the user for a phone number, creating it when missing.
 * @param {string} phone raw phone (any accepted format)
 * @param {Object} [options]
 * @param {string} [options.fullName]
 * @returns {Promise<Object>} user row
 */
async function findOrCreateUser(phone, { fullName } = {}) {
  const normalized = toLocalKey(phone);
  let user = await userModel.findByPhone(normalized);
  if (!user) {
    user = await userModel.create({ phone: normalized, fullName });
    return user;
  }
  if (fullName && !user.full_name) {
    user = await userModel.updateFullName(user.id, fullName);
  }
  return user;
}

module.exports = { findOrCreateUser };
