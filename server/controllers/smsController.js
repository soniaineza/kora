'use strict';

/**
 * SMS controller: generic send + log retrieval.
 */

const asyncHandler = require('../utils/asyncHandler');
const smsService = require('../services/smsService');
const smsLogModel = require('../models/smsLogModel');
const logger = require('../utils/logger');

const send = asyncHandler(async (req, res) => {
  const { to, message, from } = req.body;
  const result = await smsService.sendSMS({ to, message, from, purpose: 'manual' });

  if (!result.success) {
    logger.warn('Manual SMS failed', { to, error: result.error });
    return res.status(502).json({ ok: false, error: result.error });
  }
  logger.info('Manual SMS sent', { to, messageId: result.messageId });
  return res.status(200).json({
    ok: true,
    message: 'SMS sent',
    phone: result.phone,
    messageId: result.messageId,
  });
});

const getLogs = asyncHandler(async (req, res) => {
  const { phone, limit, offset } = req.query;
  const logs = await smsLogModel.list({
    phone: phone || undefined,
    limit: Number(limit) || 50,
    offset: Number(offset) || 0,
  });
  return res.status(200).json({ ok: true, logs });
});

module.exports = { send, getLogs };
