'use strict';

/**
 * Notification controller: trigger typed notifications + list history.
 */

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { stringField, stringOptional, enumOf, numberField, required } = require('../utils/validators');
const notificationService = require('../services/notificationService');

const REQUIRED_FIELDS = {
  welcome: [],
  payment_confirmation: ['plan', 'amount'],
  lesson_reminder: [],
  exam_reminder: [],
  result: ['score', 'total'],
};

const send = asyncHandler(async (req, res) => {
  const { type, phone, ...payload } = req.body;
  enumOf(type, 'type', notificationService.TYPES);
  required(phone, 'phone');

  for (const field of REQUIRED_FIELDS[type] || []) {
    if (field === 'amount') numberField(payload[field], field);
    else if (field === 'score' || field === 'total') numberField(payload[field], field);
    else stringField(payload[field], field);
  }

  const builders = {
    welcome: () => notificationService.notifyWelcome(phone, payload),
    payment_confirmation: () => notificationService.notifyPaymentConfirmation(phone, payload),
    lesson_reminder: () => notificationService.notifyLessonReminder(phone, payload),
    exam_reminder: () => notificationService.notifyExamReminder(phone, payload),
    result: () => notificationService.notifyResult(phone, payload),
  };

  const result = await builders[type]();
  logger.info('Notification sent', { type, phone, success: result.success });

  if (!result.success) {
    return res.status(502).json({ ok: false, error: result.error, type });
  }
  return res.status(200).json({
    ok: true,
    type,
    phone,
    message: 'Notification sent',
    sms: { messageId: result.messageId, success: true },
  });
});

const list = asyncHandler(async (req, res) => {
  const { limit, offset } = req.query;
  const notifications = await notificationService.listNotificationsForUser(req.auth.userId, {
    limit: Number(limit) || 50,
    offset: Number(offset) || 0,
  });
  return res.status(200).json({ ok: true, notifications });
});

module.exports = { send, list };
