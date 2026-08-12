'use strict';

/**
 * Paypack payment service.
 *
 * Talks to the Paypack REST API to initiate mobile-money cashin requests and
 * process inbound webhook events. Auth uses a short-lived access token issued
 * for a Paypack application (client_id / client_secret).
 *
 * Reference: https://docs.paypack.rw
 *   - Auth:   POST /auth/agents/authorize  {client_id, client_secret}
 *   - Cashin: POST /transactions/cashin    {amount, number}
 *   - Webhook signature: x-paypack-signature = base64(HMAC-SHA256(rawBody, secret))
 */

const crypto = require('crypto');
const fetch = require('node-fetch');

const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { config } = require('../config/env');

const TOKEN_TTL_MS = 14 * 60 * 1000; // access tokens are valid ~15 minutes

let tokenCache = { access: null, refresh: null, expiresAt: 0 };

/**
 * GET /transactions/find/{ref} — look up a transaction by its Paypack ref.
 * @param {string} ref Paypack transaction reference
 * @returns {Promise<Object|null>}
 */
async function findTransaction(ref) {
  const access = await getAccessToken();
  const res = await fetch(`${config.paypack.baseUrl}/transactions/find/${encodeURIComponent(ref)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    logger.warn('Paypack find failed', { ref, status: res.status, text });
    throw ApiError.badGateway('Paypack lookup failed');
  }
  return res.json();
}

/**
 * Authorize the application and cache the resulting access token.
 * @returns {Promise<string>} bearer access token
 */
async function authorize() {
  if (!config.paypack.enabled) {
    throw ApiError.badGateway('Paypack is not configured');
  }

  const res = await fetch(`${config.paypack.baseUrl}/auth/agents/authorize`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: config.paypack.clientId,
      client_secret: config.paypack.clientSecret,
    }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok || !body.access) {
    logger.error('Paypack authorize failed', {
      status: res.status,
      detail: body.error || body.detail || body.message || body,
    });
    throw ApiError.unauthorized('Failed to authenticate with Paypack');
  }

  tokenCache = {
    access: body.access,
    refresh: body.refresh || null,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  };
  return tokenCache.access;
}

/**
 * Refresh an existing access token, falling back to a fresh authorize.
 * @returns {Promise<string>}
 */
async function refreshToken() {
  if (tokenCache.refresh) {
    try {
      const res = await fetch(
        `${config.paypack.baseUrl}/auth/agents/refresh/${encodeURIComponent(tokenCache.refresh)}`,
        { method: 'GET', headers: { Accept: 'application/json' } }
      );
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.access) {
        tokenCache = {
          access: body.access,
          refresh: body.refresh || tokenCache.refresh,
          expiresAt: Date.now() + TOKEN_TTL_MS,
        };
        return tokenCache.access;
      }
      logger.warn('Paypack refresh failed, re-authorizing', { status: res.status });
    } catch (err) {
      logger.warn('Paypack refresh error', { error: err.message });
    }
  }
  return authorize();
}

/**
 * Get a valid access token (cached or freshly issued).
 * @returns {Promise<string>}
 */
async function getAccessToken() {
  if (tokenCache.access && Date.now() < tokenCache.expiresAt) {
    return tokenCache.access;
  }
  if (tokenCache.access) {
    return refreshToken();
  }
  return authorize();
}

/**
 * Initiate a cashin (mobile-money payment request) on behalf of a customer.
 * @param {Object} params
 * @param {number} params.amount amount in RWF
 * @param {string} params.number phone number (e.g. 0788123456)
 * @param {string} [params.idempotencyKey] unique key (max 32 chars) to prevent duplicates
 * @returns {Promise<Object>} Paypack cashin response {amount, ref, status, ...}
 */
async function requestCashin({ amount, number, idempotencyKey }) {
  const access = await getAccessToken();

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${access}`,
  };
  if (idempotencyKey) {
    headers['Idempotency-Key'] = String(idempotencyKey).slice(0, 32);
  }
  if (config.paypack.webhookMode) {
    headers['X-Webhook-Mode'] = config.paypack.webhookMode;
  }

  const res = await fetch(`${config.paypack.baseUrl}/transactions/cashin`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ amount: Number(amount), number: String(number) }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    logger.error('Paypack cashin failed', {
      status: res.status,
      detail: body.error || body.detail || body.message || body,
    });
    throw ApiError.badGateway('Paypack payment request failed');
  }

  logger.info('Paypack cashin requested', { ref: body.ref, amount, status: body.status });
  return body;
}

/**
 * Verify the x-paypack-signature header over the raw request body.
 * @param {string} rawBody raw request body string
 * @param {string} signature value of the x-paypack-signature header
 * @returns {boolean}
 */
function verifyWebhookSignature(rawBody, signature) {
  const secret = config.paypack.webhookSecret;
  if (!secret || !signature) return false;
  try {
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (_err) {
    return false;
  }
}

/**
 * Whether an inbound webhook payload is a processed transaction event.
 * @param {Object} payload
 * @returns {boolean}
 */
function isProcessedTransaction(payload) {
  return payload?.kind === 'transaction:processed' && Boolean(payload?.data);
}

module.exports = {
  getAccessToken,
  requestCashin,
  findTransaction,
  verifyWebhookSignature,
  isProcessedTransaction,
  _resetTokenCacheForTests() {
    tokenCache = { access: null, refresh: null, expiresAt: 0 };
  },
};
