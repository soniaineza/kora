'use strict';

/**
 * Notification service.
 *
 * Sends the high-level Kora SMS notifications through the SMS service and
 * persists every attempt (success or failure) in the `notifications` table.
 */

const { toLocalKey } = require('../utils/phone');
const userModel = require('../models/userModel');
const notificationModel = require('../models/notificationModel');
const smsService = require('./smsService');
const templates = require('./smsTemplates');

const TYPES = [
  'welcome',
  'payment_confirmation',
  'payment_failed',
  'subscription_reminder',
  'lesson_reminder',
  'exam_reminder',
  'result',
];

async function resolveUser(phone) {
  const normalized = toLocalKey(phone);
  const user = await userModel.findByPhone(normalized);
  return { userId: user ? user.id : null, phone: normalized };
}

async function persistNotification(phone, type, message, sent) {
  try {
    const { userId } = await resolveUser(phone);
    await notificationModel.create({ userId, phone, type, message, sent });
  } catch (err) {
    // Notification persistence must never break the SMS delivery itself.
    // eslint-disable-next-line no-console
    console.error('Failed to persist notification:', err.message);
  }
}

async function notifyWelcome(phone, { fullName } = {}) {
  const message = templates.welcome(fullName);
  const result = await smsService.sendWelcomeMessage(phone, fullName);
  await persistNotification(phone, 'welcome', message, result.success);
  return { ...result, message };
}

async function notifyPaymentConfirmation(phone, details) {
  const message = templates.paymentConfirmation(details);
  const result = await smsService.sendPaymentConfirmation(phone, details);
  await persistNotification(phone, 'payment_confirmation', message, result.success);
  return { ...result, message };
}

async function notifyLessonReminder(phone, details) {
  const message = templates.lessonReminder(details);
  const result = await smsService.sendLessonReminder(phone, details);
  await persistNotification(phone, 'lesson_reminder', message, result.success);
  return { ...result, message };
}

async function notifyExamReminder(phone, details) {
  const message = templates.examReminder(details);
  const result = await smsService.sendExamReminder(phone, details);
  await persistNotification(phone, 'exam_reminder', message, result.success);
  return { ...result, message };
}

async function notifyResult(phone, details) {
  const message = templates.result(details);
  const result = await smsService.sendResultNotification(phone, details);
  await persistNotification(phone, 'result', message, result.success);
  return { ...result, message };
}

async function notifyPaymentFailed(phone, details) {
  const message = templates.paymentFailed(details);
  const result = await smsService.sendPaymentFailed(phone, details);
  await persistNotification(phone, 'payment_failed', message, result.success);
  return { ...result, message };
}

async function notifySubscriptionReminder(phone, details) {
  const message = templates.subscriptionReminder(details);
  const result = await smsService.sendSubscriptionReminder(phone, details);
  await persistNotification(phone, 'subscription_reminder', message, result.success);
  return { ...result, message };
}

async function listNotificationsForUser(userId, { limit, offset } = {}) {
  return notificationModel.listByUser(userId, { limit, offset });
}

module.exports = {
  TYPES,
  notifyWelcome,
  notifyPaymentConfirmation,
  notifyPaymentFailed,
  notifySubscriptionReminder,
  notifyLessonReminder,
  notifyExamReminder,
  notifyResult,
  listNotificationsForUser,
};
