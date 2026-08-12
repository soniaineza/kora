'use strict';

/**
 * Phone number utilities for Rwanda (Kora's primary market).
 *
 * Accepted input formats:
 *   - 0788123456  (10 digits, leading 0)
 *   - 788123456   (9 digits)
 *   - 250788123456 (12 digits, country code)
 *   - +250788123456 (13 chars, with '+')
 *
 * Internal phone keys are always normalized to digits only (e.g. `0788123456`).
 * Outbound SMS recipients are converted to E.164 (`+250788123456`) which the
 * Africa's Talking SDK requires.
 */

const PHONE_REGEX = /^(?:\+?250)?0?7\d{8}$/;

/**
 * Keep digits only.
 * @param {string|number} raw
 * @returns {string}
 */
function normalizePhone(raw) {
  return String(raw || '').replace(/\D/g, '');
}

/**
 * @param {string|number} raw
 * @returns {boolean} true when the number is a valid Rwandan mobile number
 */
function isValidRwandaPhone(raw) {
  const digits = normalizePhone(raw);
  if (!PHONE_REGEX.test(digits) && !PHONE_REGEX.test(`+${digits}`)) {
    return false;
  }
  const nine = digits.replace(/^(250|0)/, '').slice(0, 9);
  return /^7\d{8}$/.test(nine);
}

/**
 * Convert any accepted local format to E.164 for SMS delivery.
 * @param {string|number} raw
 * @returns {string}
 */
function toInternationalPhone(raw) {
  const digits = normalizePhone(raw);
  if (digits.startsWith('250')) {
    return `+${digits}`;
  }
  if (digits.startsWith('0')) {
    return `+250${digits.slice(1)}`;
  }
  return `+250${digits}`;
}

/**
 * Canonical database key for a phone number: the 10-digit local form
 * `07XXXXXXXX`. Every row (users, otp_codes, notifications) uses this same
 * key so lookups are consistent regardless of how the number was entered.
 * @param {string|number} raw
 * @returns {string}
 */
function toLocalKey(raw) {
  const digits = normalizePhone(raw);
  if (digits.startsWith('250')) return `0${digits.slice(3)}`;
  if (digits.startsWith('0')) return digits;
  return `0${digits}`;
}

module.exports = { normalizePhone, isValidRwandaPhone, toInternationalPhone, toLocalKey };
