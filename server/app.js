'use strict';

/**
 * Express application assembly.
 *
 * Middleware order:
 *   helmet -> cors -> body parsing -> sanitization -> global rate limit ->
 *   request logging -> routes -> 404 -> central error handler
 *
 * Exported as a factory-free singleton so tests can start the server on an
 * ephemeral port and hit it over HTTP.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { config } = require('./config/env');
const logger = require('./utils/logger');
const asyncHandler = require('./utils/asyncHandler');
const ApiError = require('./utils/ApiError');
const { normalizePhone } = require('./utils/phone');

const { sanitizeRequest } = require('./middleware/sanitize');
const { requireAuth } = require('./middleware/auth');
const { globalLimiter, otpSendLimiter } = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/requestLogger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const smsRoutes = require('./routes/smsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminPaymentRoutes = require('./routes/adminPaymentRoutes');
const paypackWebhookRoutes = require('./routes/paypackWebhookRoutes');

const otpService = require('./services/otpService');
const packageService = require('./services/packageService');
const notificationService = require('./services/notificationService');
const { startReminderJob } = require('./jobs/reminderJob');

const app = express();

app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://kora-nine-phi.vercel.app',
  ...config.corsOrigins.split(',').map((origin) => origin.trim()).filter(Boolean),
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

// Paypack webhooks must be verified against the raw body, so parse this path
// as a raw Buffer before the global JSON parser runs.
app.use('/webhooks/paypack', express.raw({ type: () => true }));
app.use('/webhooks/paypack', paypackWebhookRoutes);

app.use(express.json({ limit: '1mb' }));
app.use(sanitizeRequest);
app.use('/api', globalLimiter);
app.use(requestLogger);

/* ------------------------------------------------------------------ */
/* Modular API                                                         */
/* ------------------------------------------------------------------ */

app.use('/api/auth', authRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);

/* ------------------------------------------------------------------ */
/* Health                                                              */
/* ------------------------------------------------------------------ */

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, paymentMode: config.paymentMode });
});

app.get('/', (_req, res) => {
  res.json({
    message: 'Kora backend is running',
    status: 'OK',
    paymentMode: config.paymentMode,
  });
});

/* ------------------------------------------------------------------ */
/* Legacy OTP endpoints (kept for the existing web frontend)           */
/* ------------------------------------------------------------------ */

function methodNotAllowed(req, res) {
  return res.status(405).json({
    error: `Method ${req.method} not allowed. Use POST.`,
  });
}

app.get('/api/otp/send', methodNotAllowed);
app.get('/api/otp/verify', methodNotAllowed);

app.post(
  '/api/otp/send',
  otpSendLimiter,
  asyncHandler(async (req, res) => {
    const result = await otpService.sendOtp(req.body?.phone);
    res.json({ ok: true, expiresAt: result.expiresAt, ...(result.devCode ? { devCode: result.devCode } : {}) });
  })
);

app.post(
  '/api/otp/verify',
  asyncHandler(async (req, res) => {
    const result = await otpService.verifyOtp(req.body?.phone, req.body?.code);
    res.json({ ok: true, token: result.token, phone: result.phone, user: result.user });
  })
);

/* ------------------------------------------------------------------ */
/* Legacy exam endpoints                                               */
/* ------------------------------------------------------------------ */

app.get(
  '/api/internal/free-exam/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const phone = req.auth?.phone;
    if (!phone) throw ApiError.unauthorized('Missing phone in token');

    const { getSupabaseAdmin } = require('./database/supabase');
    const { data, error } = await getSupabaseAdmin()
      .from('exam_sessions')
      .select('id')
      .eq('phone', phone)
      .eq('plan', 'FREE_SAMPLE')
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return res.json({ ok: true, alreadyTaken: !!data });
  })
);

app.post(
  '/api/internal/free-exam/complete',
  requireAuth,
  asyncHandler(async (req, res) => {
    const phone = req.auth?.phone;
    if (!phone) throw ApiError.unauthorized('Missing phone in token');

    const { score, totalQuestions } = req.body || {};
    const now = new Date().toISOString();

    const { getSupabaseAdmin } = require('./database/supabase');
    const { data: existing, error: existingErr } = await getSupabaseAdmin()
      .from('exam_sessions')
      .select('id')
      .eq('phone', phone)
      .eq('plan', 'FREE_SAMPLE')
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle();
    if (existingErr) throw existingErr;
    if (existing) return res.json({ ok: true, alreadyCompleted: true });

    const sessionId = `fs_${phone}_${Date.now()}`;
    const payload = {
      id: sessionId,
      phone,
      plan: 'FREE_SAMPLE',
      status: 'completed',
      score: Number(score ?? 0),
      total_questions: Number(totalQuestions ?? 20),
      updated_at: now,
      completed_at: now,
      expires_at: null,
    };
    const { error: insErr } = await getSupabaseAdmin().from('exam_sessions').insert(payload);
    if (insErr) throw insErr;
    return res.json({ ok: true, alreadyCompleted: false });
  })
);

app.get(
  '/api/internal/active-package',
  requireAuth,
  asyncHandler(async (req, res) => {
    const plan = packageService.getPlan(req.query.plan);
    const phone = req.auth?.phone;
    if (!plan) throw ApiError.badRequest('plan is required');
    if (!phone) throw ApiError.unauthorized('Missing phone in token');

    const pkg = await packageService.findActivePackage(phone, plan.key);
    if (!pkg) {
      return res.json({ ok: true, active: false, remaining_attempts: 0 });
    }
    return res.json({
      ok: true,
      active: true,
      package: pkg,
      remaining_attempts: pkg.unlimited ? 999999 : pkg.remaining_attempts ?? 0,
      expires_at: pkg.expires_at,
    });
  })
);

app.get(
  '/api/internal/active-session',
  requireAuth,
  asyncHandler(async (req, res) => {
    const plan = packageService.getPlan(req.query.plan);
    const phone = req.auth?.phone;
    if (!plan) throw ApiError.badRequest('plan is required');

    const { getSupabaseAdmin } = require('./database/supabase');
    const { data, error } = await getSupabaseAdmin()
      .from('exam_sessions')
      .select('*')
      .eq('phone', phone)
      .eq('plan', plan.key)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return res.json({ ok: true, session: data || null });
  })
);

app.post(
  '/api/internal/start-exam',
  requireAuth,
  asyncHandler(async (req, res) => {
    const plan = packageService.getPlan(req.body?.plan);
    const phone = req.auth?.phone;
    if (!plan) throw ApiError.badRequest('Unknown package');
    if (!phone) throw ApiError.unauthorized('Missing phone in token');

    const activePackage = await packageService.findActivePackage(phone, plan.key);
    if (!activePackage) {
      throw ApiError.forbidden('No active package. Please buy a package.');
    }

    const session = await packageService.createExamSession({ phone, planKey: plan.key, userPackage: activePackage });
    return res.json({ ok: true, sessionId: session.id, session });
  })
);

app.get(
  '/api/internal/session',
  requireAuth,
  asyncHandler(async (req, res) => {
    const sessionId = String(req.query.sessionId || '');
    const phone = req.auth?.phone;
    if (!sessionId) throw ApiError.badRequest('sessionId is required');

    const { getSupabaseAdmin } = require('./database/supabase');
    const { data, error } = await getSupabaseAdmin()
      .from('exam_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('phone', phone)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw ApiError.notFound('Session not found');
    if (data.status !== 'active') throw new ApiError('Session is already completed', 409);
    if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
      throw new ApiError('Session has expired', 410);
    }
    return res.json({ ok: true, session: data });
  })
);

app.post(
  '/api/internal/submit-exam',
  requireAuth,
  asyncHandler(async (req, res) => {
    const phone = req.auth?.phone;
    const sessionId = String(req.body?.sessionId || '');
    const score = Number(req.body?.score ?? 0);
    const totalQuestions = Number(req.body?.totalQuestions ?? 20);
    if (!sessionId) throw ApiError.badRequest('sessionId is required');

    const { getSupabaseAdmin } = require('./database/supabase');
    const { data: existing, error: readError } = await getSupabaseAdmin()
      .from('exam_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('phone', phone)
      .limit(1)
      .maybeSingle();
    if (readError) throw readError;
    if (!existing) throw ApiError.notFound('Session not found');
    if (existing.status === 'completed') {
      return res.json({ ok: true, alreadySubmitted: true, session: existing });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('exam_sessions')
      .update({
        status: 'completed',
        score,
        total_questions: totalQuestions,
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('phone', phone)
      .select('*')
      .single();
    if (error) throw error;

    const passed = score >= Math.ceil(totalQuestions / 2);
    notificationService
      .notifyResult(phone, { score, total: totalQuestions, passed })
      .catch((err) => logger.warn('Result SMS notification failed', { error: err.message }));

    return res.json({ ok: true, session: data });
  })
);

/* ------------------------------------------------------------------ */
/* Books                                                               */
/* ------------------------------------------------------------------ */

const path = require('path');
const fs = require('fs');
const BOOKS_DIR = path.join(__dirname, 'books');

app.get(
  '/api/internal/book/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const phone = req.auth?.phone;
    if (!phone) throw ApiError.unauthorized('Missing phone in token');
    const pkg = await packageService.findActivePackage(phone, 'BOOK');
    return res.json({ ok: true, hasAccess: !!pkg, package: pkg });
  })
);

app.get(
  '/api/internal/book/pdf',
  requireAuth,
  asyncHandler(async (req, res) => {
    const phone = req.auth?.phone;
    if (!phone) throw ApiError.unauthorized('Missing phone in token');
    const pkg = await packageService.findActivePackage(phone, 'BOOK');
    if (!pkg) {
      throw ApiError.forbidden('No active book package. Please purchase the book.');
    }
    const pdfPath = path.join(BOOKS_DIR, 'IGAZETI-1.pdf');
    if (!fs.existsSync(pdfPath)) {
      throw ApiError.notFound('Book file not found');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(pdfPath);
  })
);

/* ------------------------------------------------------------------ */
/* Start Background Jobs                                               */
/* ------------------------------------------------------------------ */

if (config.isProduction || process.env.ENABLE_JOBS === 'true') {
  startReminderJob();
  logger.info('Background jobs started');
}

/* ------------------------------------------------------------------ */
/* Fallbacks                                                           */
/* ------------------------------------------------------------------ */

app.use(notFound);
app.use(errorHandler);

module.exports = app;
