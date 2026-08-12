'use strict';

/**
 * Lightweight input sanitization. Strips control characters and trims string
 * values so stored/forwarded data cannot contain newline injection or
 * invisible Unicode control chars.
 */

function cleanString(value) {
  return String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

function sanitizeValue(value) {
  if (typeof value === 'string') return cleanString(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') return sanitizeObject(value);
  return value;
}

function sanitizeObject(obj) {
  const out = {};
  for (const key of Object.keys(obj || {})) {
    out[key] = sanitizeValue(obj[key]);
  }
  return out;
}

module.exports = { cleanString, sanitizeValue, sanitizeObject };
