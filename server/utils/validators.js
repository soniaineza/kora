'use strict';

/**
 * Field validators used by the request-validation middleware.
 * Each validator returns the sanitized value or throws an ApiError.
 */

const ApiError = require('./ApiError');
const { isValidRwandaPhone, toInternationalPhone } = require('./phone');

const OTP_REGEX = /^\d{6}$/;

function required(value, name) {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw ApiError.badRequest(`${name} is required`);
  }
  return value;
}

function phone(value) {
  required(value, 'phone');
  if (!isValidRwandaPhone(value)) {
    throw ApiError.badRequest('phone must be a valid Rwandan mobile number');
  }
  return toInternationalPhone(value);
}

function otp(value) {
  required(value, 'code');
  const code = String(value).trim();
  if (!OTP_REGEX.test(code)) {
    throw ApiError.badRequest('code must be exactly 6 digits');
  }
  return code;
}

function stringField(value, name, { min = 1, max = 500 } = {}) {
  required(value, name);
  const text = String(value).trim();
  if (text.length < min || text.length > max) {
    throw ApiError.badRequest(`${name} must be between ${min} and ${max} characters`);
  }
  return text;
}

function password(value) {
  required(value, 'password');
  const text = String(value);
  if (text.length < 6 || text.length > 72) {
    throw ApiError.badRequest('password must be between 6 and 72 characters');
  }
  return text;
}

function emailOptional(value, name = 'email') {
  if (value === undefined || value === null || String(value).trim() === '') return undefined;
  const text = String(value).trim().toLowerCase();
  if (text.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    throw ApiError.badRequest(`${name} must be a valid email address`);
  }
  return text;
}

function stringOptional(value, name, { max = 500 } = {}) {
  if (value === undefined || value === null) return undefined;
  const text = String(value).trim();
  if (text.length > max) {
    throw ApiError.badRequest(`${name} must be at most ${max} characters`);
  }
  return text;
}

function enumOf(value, name, allowed) {
  required(value, name);
  if (!allowed.includes(value)) {
    throw ApiError.badRequest(`${name} must be one of: ${allowed.join(', ')}`);
  }
  return value;
}

function numberField(value, name, { min, max } = {}) {
  required(value, name);
  const num = Number(value);
  if (Number.isNaN(num)) {
    throw ApiError.badRequest(`${name} must be a number`);
  }
  if ((min !== undefined && num < min) || (max !== undefined && num > max)) {
    throw ApiError.badRequest(`${name} must be between ${min} and ${max}`);
  }
  return num;
}

module.exports = {
  required,
  phone,
  otp,
  password,
  emailOptional,
  stringField,
  stringOptional,
  enumOf,
  numberField,
  OTP_REGEX,
};
