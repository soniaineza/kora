'use strict';

/**
 * SMS service.
 *
 * Thin wrapper around the Africa's Talking client. Every send:
 *   1. normalizes/validates the recipient,
 *   2. builds the message from a template,
 *   3. calls the provider,
 *   4. records the outcome in sms_logs,
 *   5. returns a { success, ... } result object instead of throwing on
 *      provider errors (failures are logged and returned gracefully).
 */

const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { normalizePhone, isValidRwandaPhone, toInternationalPhone } = require('../utils/phone');
const smsLogModel = require('../models/smsLogModel');
const africastalking = require('./africastalking');
const templates = require('./smsTemplates');

/**
 * @param {Object} options
 * @param {string} options.to      phone number in any accepted local format
 * @param {string} options.message
 * @param {string} [options.from]  override sender ID/shortcode
 * @param {string} [options.purpose] logical purpose tag stored in sms_logs
 * @returns {Promise<{success: boolean, phone?: string, messageId?: string|null, error?: string, providerResponse?: *}>}
 */
async function sendSMS({ to, message, from, purpose = 'general' }) {
  if (!message || !String(message).trim()) {
    return { success: false, error: 'message is required' };
  }

  const digits = normalizePhone(to);
  if (!isValidRwandaPhone(digits)) {
    logger.warn('SMS rejected: invalid phone number', { to });
    return { success: false, error: 'Invalid phone number' };
  }

  const recipient = toInternationalPhone(digits);
  const result = {
    success: false,
    phone: recipient,
    message,
    purpose,
    messageId: null,
    providerResponse: null,
    error: null,
  };

  try {
    const providerResponse = await africastalking.sendRawSms({
      to: recipient,
      message,
      ...(from ? { from } : {}),
    });
    result.providerResponse = providerResponse;

    const recipientInfo = providerResponse?.SMSMessageData?.Recipients?.[0];
    if (recipientInfo?.status === 'Success') {
      result.success = true;
      result.messageId = recipientInfo.messageId || null;
      await smsLogModel.create({
        phone: recipient,
        message,
        status: 'sent',
        purpose,
        providerResponse,
      });
      logger.info('SMS sent', { phone: recipient, purpose, messageId: result.messageId });
    } else {
      result.error = recipientInfo?.statusDescription || 'SMS delivery failed';
      await smsLogModel.create({
        phone: recipient,
        message,
        status: 'failed',
        purpose,
        providerResponse,
      });
      logger.warn('SMS delivery failed', { phone: recipient, purpose, provider: result.error });
    }
  } catch (err) {
    result.error = err?.message || 'SMS send failed';
    result.providerResponse = { error: result.error, provider: err?.response?.data ?? undefined };
    await smsLogModel
      .create({
        phone: recipient,
        message,
        status: 'failed',
        purpose,
        providerResponse: result.providerResponse,
      })
      .catch((logErr) => logger.error('Failed to persist sms_log', { error: logErr.message }));
    logger.error('SMS send error', { phone: recipient, purpose, error: result.error });
  }

  return result;
}

async function sendOTP(phone, code) {
  return sendSMS({ to: phone, message: templates.otp(code), purpose: 'otp' });
}

async function sendWelcomeMessage(phone, fullName) {
  return sendSMS({
    to: phone,
    message: templates.welcome(fullName),
    purpose: 'welcome',
  });
}

async function sendLessonReminder(phone, details) {
  return sendSMS({
    to: phone,
    message: templates.lessonReminder(details),
    purpose: 'lesson_reminder',
  });
}

async function sendExamReminder(phone, details) {
  return sendSMS({
    to: phone,
    message: templates.examReminder(details),
    purpose: 'exam_reminder',
  });
}

async function sendPaymentConfirmation(phone, details) {
  return sendSMS({
    to: phone,
    message: templates.paymentConfirmation(details),
    purpose: 'payment_confirmation',
  });
}

async function sendResultNotification(phone, details) {
  return sendSMS({
    to: phone,
    message: templates.result(details),
    purpose: 'result',
  });
}

async function sendPaymentFailed(phone, details) {
  return sendSMS({
    to: phone,
    message: templates.paymentFailed(details),
    purpose: 'payment_failed',
  });
}

async function sendSubscriptionReminder(phone, details) {
  return sendSMS({
    to: phone,
    message: templates.subscriptionReminder(details),
    purpose: 'subscription_reminder',
  });
}

module.exports = {
  sendSMS,
  sendOTP,
  sendWelcomeMessage,
  sendLessonReminder,
  sendExamReminder,
  sendPaymentConfirmation,
  sendPaymentFailed,
  sendSubscriptionReminder,
  sendResultNotification,
};
