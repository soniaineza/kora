'use strict';

/**
 * Paypack webhook endpoint.
 *
 * Paypack first pings the URL with a HEAD request to confirm it is reachable,
 * then POSTs a `transaction:processed` event. Every POST carries an
 * `x-paypack-signature` header (base64 HMAC-SHA256 of the raw body) that is
 * verified against the configured webhook secret.
 */

const express = require('express');
const router = express.Router();

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const paypackService = require('../services/paypackService');
const paymentService = require('../services/paymentService');

// Paypack accessibility ping — must respond 2xx so events are delivered.
router.head('/', (_req, res) => {
  res.status(200).end();
});

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const signature = req.get('x-paypack-signature');

    let rawBody;
    let payload;
    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString('utf8');
      try {
        payload = JSON.parse(rawBody || '{}');
      } catch (_err) {
        throw ApiError.badRequest('Invalid JSON body');
      }
    } else {
      rawBody = typeof req.rawBody === 'string' ? req.rawBody : JSON.stringify(req.body || {});
      payload = req.body || {};
    }

    if (!signature || !paypackService.verifyWebhookSignature(rawBody, signature)) {
      throw ApiError.unauthorized('Invalid webhook signature');
    }
    logger.info('Paypack webhook received', { kind: payload.kind, eventId: payload.event_id });

    if (!paypackService.isProcessedTransaction(payload)) {
      return res.json({ ok: true, ignored: true });
    }

    const { data } = payload;
    const providerRef = data?.ref;
    if (!providerRef) {
      return res.json({ ok: true, ignored: true });
    }

    if (data.kind === 'CASHIN' && data.status === 'successful') {
      const result = await paymentService.applyWebhookActivation({ providerRef });
      return res.json({ ok: true, ...result });
    }

    if (data.status === 'failed' || data.status === 'rejected') {
      const result = await paymentService.failOrderFromWebhook({
        providerRef,
        reason: `Paypack: ${data.status}`,
      });
      return res.json({ ok: true, ...result });
    }

    return res.json({ ok: true, ignored: true });
  })
);

module.exports = router;
