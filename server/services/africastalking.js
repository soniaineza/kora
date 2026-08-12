'use strict';

/**
 * Africa's Talking client factory.
 *
 * - Credentials come from config (env vars).
 * - The SDK switches to sandbox automatically when the configured username is
 *   the literal string `sandbox`.
 * - setSmsClientForTests() lets integration tests inject a fake client.
 */

const africastalking = require('africastalking');
const { config } = require('../config/env');
const ApiError = require('../utils/ApiError');

let cachedClient = null;
let cachedSms = null;
let testSms = null;

function isConfigured() {
  return Boolean(config.africastalking.username && config.africastalking.apiKey);
}

function getSmsClient() {
  if (testSms) return testSms;
  if (cachedSms) return cachedSms;
  if (!isConfigured()) {
    throw ApiError.serviceUnavailable(
      "Africa's Talking is not configured (AFRICASTALKING_USERNAME / AFRICASTALKING_API_KEY)"
    );
  }

  if (!cachedClient) {
    cachedClient = africastalking({
      username: config.africastalking.username,
      apiKey: config.africastalking.apiKey,
    });
  }
  cachedSms = cachedClient.SMS;
  return cachedSms;
}

/**
 * Send an SMS through Africa's Talking.
 *
 * @param {Object} params
 * @param {string} params.to     recipient in E.164 format (e.g. +250788123456)
 * @param {string} params.message
 * @param {string} [params.from] sender ID / shortcode; optional in sandbox
 * @returns {Promise<*>} raw provider response ({ SMSMessageData: ... })
 */
async function sendRawSms({ to, message, from }) {
  const sms = getSmsClient();
  const payload = { to, message };
  const senderId = from || config.africastalking.senderId;
  if (senderId) payload.from = senderId;
  return sms.send(payload);
}

/** Test-only hook. */
function setSmsClientForTests(fakeSms) {
  testSms = fakeSms;
}

/** Test-only hook. */
function resetSmsClientForTests() {
  testSms = null;
  cachedClient = null;
  cachedSms = null;
}

module.exports = { isConfigured, getSmsClient, sendRawSms, setSmsClientForTests, resetSmsClientForTests };
