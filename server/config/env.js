'use strict';

/**
 * Environment configuration loader + validator.
 *
 * Loads `.env` files from the project root and the server directory, then
 * exposes a single validated `config` object. Any required variable that is
 * missing in production aborts startup with a clear error.
 *
 * Required variables (production):
 *   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET
 *
 * Africa's Talking (optional until SMS is needed):
 *   AFRICASTALKING_USERNAME | AFRICAS_TALKING_USERNAME
 *   AFRICASTALKING_API_KEY   | AFRICAS_TALKING_API_KEY
 *   AFRICASTALKING_SENDER_ID | AFRICAS_TALKING_SENDER_ID
 *
 * The SDK enables sandbox mode automatically when the username is `sandbox`.
 */

const path = require('path');
const dotenv = require('dotenv');

const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '..', '.env.local'),
  path.resolve(__dirname, '..', '..', '.env'),
  path.resolve(__dirname, '..', '..', '.env.local'),
];

for (const envPath of envPaths) {
  dotenv.config({ path: envPath, override: false });
}

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const isTest = NODE_ENV === 'test';

const firstDefined = (...values) => values.find((value) => value !== undefined && value !== '');

const config = {
  env: NODE_ENV,
  isProduction,
  isTest,
  port: Number(process.env.PORT || 5001),
  supabase: {
    url: firstDefined(process.env.SUPABASE_URL, process.env.VITE_SUPABASE_URL),
    anonKey: firstDefined(process.env.SUPABASE_ANON_KEY, process.env.VITE_SUPABASE_ANON_KEY),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  jwt: {
    secret: firstDefined(process.env.JWT_SECRET, isProduction ? null : 'dev-secret'),
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    issuer: process.env.JWT_ISSUER || 'kora',
    audience: process.env.JWT_AUDIENCE || 'kora-web',
  },
  africastalking: {
    username: firstDefined(
      process.env.AFRICASTALKING_USERNAME,
      process.env.AFRICAS_TALKING_USERNAME
    ) || '',
    apiKey: firstDefined(
      process.env.AFRICASTALKING_API_KEY,
      process.env.AFRICAS_TALKING_API_KEY
    ) || '',
    senderId: firstDefined(
      process.env.AFRICASTALKING_SENDER_ID,
      process.env.AFRICAS_TALKING_SENDER_ID
    ) || '',
    get sandbox() {
      return this.username.toLowerCase() === 'sandbox';
    },
  },
  otp: {
    ttlMs: Number(process.env.OTP_TTL_MS || 5 * 60 * 1000),
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS || 5),
    resendIntervalMs: Number(process.env.OTP_RESEND_INTERVAL_MS || 60 * 1000),
    secret: process.env.OTP_SECRET || process.env.JWT_SECRET || 'otp-dev-secret',
    devCode: process.env.DEV_OTP_CODE || '123456',
  },
  corsOrigins: process.env.CORS_ORIGINS || '',
  paymentMode: (process.env.PAYMENT_MODE || 'demo').toLowerCase(),
  examDurationSeconds: Number(process.env.EXAM_DURATION_SECONDS || 20 * 60),
  paypack: {
    clientId: process.env.PAYPACK_CLIENT_ID || '',
    clientSecret: process.env.PAYPACK_CLIENT_SECRET || '',
    baseUrl: (process.env.PAYPACK_BASE_URL || 'https://payments.paypack.rw/api').replace(/\/+$/, ''),
    webhookSecret: process.env.PAYPACK_WEBHOOK_SECRET || '',
    webhookMode: (process.env.PAYPACK_WEBHOOK_MODE || 'production').toLowerCase(),
    get enabled() {
      return Boolean(this.clientId && this.clientSecret);
    },
  },
};

if (!config.supabase.url || !config.supabase.anonKey) {
  throw new Error('Missing required environment variable: SUPABASE_URL or SUPABASE_ANON_KEY');
}

if (isProduction) {
  const missing = [];
  if (!config.supabase.serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!config.jwt.secret) missing.push('JWT_SECRET');
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s) in production: ${missing.join(', ')}`);
  }
}

module.exports = { config, NODE_ENV, isProduction, isTest };
