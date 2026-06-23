const path = require('path');
const dotenv = require('dotenv');

[
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, '.env.local'),
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '..', '.env.local'),
].forEach((envPath) => {
  dotenv.config({ path: envPath, override: false });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://kora-nine-phi.vercel.app',
  ...(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

app.use((req, _res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
}

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey
);

const JWT_SECRET = process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === 'production';

if (!JWT_SECRET && isProduction) {
  throw new Error('Missing JWT_SECRET in production');
}

const jwtSecret = JWT_SECRET || 'dev-secret';
const paymentMode = (process.env.PAYMENT_MODE || 'demo').toLowerCase();

// OTP sending is handled in this repo as a dev OTP.
// Real SMS integration can be added later; however, the OTP endpoints must still work.
// If you are seeing "no OTP received", use devCode and verify with the returned value.
// When NODE_ENV=production, the backend generates a random code, so you cannot see it.
// To make it work during testing, set NODE_ENV !== 'production' and (optionally) DEV_OTP_CODE.

// console.log('ENV:', {
//   NODE_ENV: process.env.NODE_ENV,
//   PAYMENT_MODE: paymentMode,
//   SUPABASE_URL: process.env.SUPABASE_URL ? '***' : undefined,
//   HAS_JWT_SECRET: Boolean(process.env.JWT_SECRET),
// });

const PLAN_MAP = {
  STARTER: { days: 3, exams: 10, amountRwf: 500, unlimited: false },
  BASIC: { days: 5, exams: 15, amountRwf: 1000, unlimited: false },
  STANDARD: { days: 7, exams: 20, amountRwf: 1500, unlimited: false },
  MASTER: { days: 10, exams: 20, amountRwf: 2000, unlimited: false },
  PREMIUM: { days: 15, exams: 25, amountRwf: 3000, unlimited: false },
  PRO: { days: 30, exams: 50, amountRwf: 5000, unlimited: false },
  UNLIMITED: { days: null, exams: null, amountRwf: 7000, unlimited: true },
};

const EXAM_DURATION_SECONDS = Number(process.env.EXAM_DURATION_SECONDS || 20 * 60);

function normalizePhone(raw) {
  return String(raw || '').replace(/\D/g, '');
}

function getPlan(packageKey) {
  const key = String(packageKey || '').toUpperCase();
  const plan = PLAN_MAP[key];
  if (!plan) return null;
  return { key, ...plan };
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function signToken(phone) {
  return jwt.sign({ phone }, jwtSecret, { expiresIn: '30d' });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.auth = payload;
    return next();
  } catch (_err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function methodNotAllowed(req, res) {
  return res.status(405).json({
    error: `Method ${req.method} not allowed. Use POST.`,
  });
}

async function activatePackage(paymentReference) {
  const { data: pkg, error: readError } = await supabaseAdmin
    .from('user_packages')
    .select('*')
    .eq('payment_reference', paymentReference)
    .limit(1)
    .maybeSingle();

  if (readError) throw readError;
  if (!pkg) {
    const err = new Error('Payment reference not found');
    err.statusCode = 404;
    throw err;
  }

  const plan = getPlan(pkg.package_key);
  if (!plan) {
    const err = new Error('Unknown package');
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  const expiresAt = plan.days ? addDays(now, plan.days).toISOString() : null;

  const { data, error } = await supabaseAdmin
    .from('user_packages')
    .update({
      status: 'active',
      activated_at: now.toISOString(),
      expires_at: expiresAt,
      total_attempts: plan.unlimited ? null : plan.exams,
      remaining_attempts: plan.unlimited ? null : plan.exams,
      unlimited: plan.unlimited,
      amount_rwf: plan.amountRwf,
    })
    .eq('id', pkg.id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function findActivePackage(phone, planKey) {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('user_packages')
    .select('*')
    .eq('phone', phone)
    .eq('package_key', planKey)
    .eq('status', 'active')
    .or(`expires_at.gt.${nowIso},expires_at.is.null`)
    .order('activated_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0] || null;
}

async function createExamSession({ phone, planKey, userPackage }) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + EXAM_DURATION_SECONDS * 1000);
  const sessionId = `ex_${phone}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`.replace(
    /[^0-9a-zA-Z_-]/g,
    ''
  );

  if (!userPackage.unlimited) {
    const remaining = Number(userPackage.remaining_attempts || 0);
    if (remaining <= 0) {
      const err = new Error('No remaining attempts for this package');
      err.statusCode = 403;
      throw err;
    }

    const { error: attemptError } = await supabaseAdmin
      .from('user_packages')
      .update({ remaining_attempts: remaining - 1 })
      .eq('id', userPackage.id)
      .eq('remaining_attempts', remaining);

    if (attemptError) throw attemptError;
  }

  const { data: session, error: sessionError } = await supabaseAdmin
    .from('exam_sessions')
    .insert({
      id: sessionId,
      phone,
      plan: planKey,
      status: 'active',
      expires_at: expiresAt.toISOString(),
      user_package_id: userPackage.id,
      duration_seconds: EXAM_DURATION_SECONDS,
    })
    .select('*')
    .single();

  if (sessionError) throw sessionError;

  await supabaseAdmin.from('attempt_history').insert({
    user_id: phone,
    user_package_id: userPackage.id,
    exam_session_id: sessionId,
    plan: planKey,
    attempt_consumed: true,
  });

  return session;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, paymentMode });
});

app.post('/api/otp/send', async (req, res) => {
  try {
    const phone = normalizePhone(req.body?.phone);

    if (phone.length < 9) {
      return res.status(400).json({ error: 'Enter a valid phone number' });
    }

    const code =
      process.env.NODE_ENV === 'production'
        ? String(Math.floor(100000 + Math.random() * 900000))
        : process.env.DEV_OTP_CODE || '123456';

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error } = await supabaseAdmin
      .from('phone_verifications')
      .upsert({
        phone,
        code,
        expires_at: expiresAt,
        purpose: 'registration',
        verified_at: null,
      });

    if (error) throw error;

    // In demo/dev this makes the web usable without an SMS provider.
    return res.json({
      ok: true,
      expiresAt,
      ...(process.env.NODE_ENV === 'production' ? {} : { devCode: code }),
    });
  } catch (e) {
    console.error('OTP SEND ERROR:', e);
    return res.status(500).json({ error: e.message || 'Internal Server Error' });
  }
});

app.post('/api/otp/verify', async (req, res) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    const code = String(req.body?.code || '').trim();

    if (phone.length < 9 || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Invalid phone or verification code' });
    }

    const { data, error } = await supabaseAdmin
      .from('phone_verifications')
      .select('*')
      .eq('phone', phone)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    // In demo/dev we don’t have an SMS provider, so the UI needs to be usable.
    // When NODE_ENV !== 'production' we accept any valid 6-digit code.
    if (!data) {
      return res.status(401).json({ error: 'Verification code is incorrect' });
    }

    // Demo mode switch (recommended).
    // Set OTP_DEMO=true in Render env variables to allow any 6-digit code.
    // If OTP_DEMO is false/unset, require exact code match.
    const otpDemo = String(process.env.OTP_DEMO || '').toLowerCase() === 'true';
    if (!otpDemo) {
      if (data.code !== code) {
        return res.status(401).json({ error: 'Verification code is incorrect' });
      }
    }




    if (new Date(data.expires_at).getTime() < Date.now()) {
      return res.status(401).json({ error: 'Verification code has expired' });
    }

    const { error: updateError } = await supabaseAdmin
      .from('phone_verifications')
      .update({ verified_at: new Date().toISOString() })
      .eq('phone', phone);

    if (updateError) throw updateError;

    return res.json({ ok: true, token: signToken(phone), phone });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get('/api/payments/mtn/start', methodNotAllowed);
app.get('/api/payments/airtel/start', methodNotAllowed);

app.post('/api/payments/:network/start', requireAuth, async (req, res) => {
  try {
    const network = String(req.params.network || '').toLowerCase();
    if (!['mtn', 'airtel'].includes(network)) {
      return res.status(400).json({ error: 'Unsupported payment network' });
    }

    const plan = getPlan(req.body?.packageKey);
    if (!plan) {
      return res.status(400).json({ error: 'Unknown package' });
    }

    const phone = req.auth.phone;
    const paymentSessionId = `ps_${network}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const { error } = await supabaseAdmin.from('user_packages').insert({
      id: paymentSessionId,
      phone,
      package_key: plan.key,
      network,
      amount_rwf: plan.amountRwf,
      status: 'pending',
      payment_reference: paymentSessionId,
    });

    if (error) throw error;

    let activated = false;
    if (paymentMode !== 'live') {
      await activatePackage(paymentSessionId);
      activated = true;
    }

    return res.json({
      ok: true,
      paymentSessionId,
      amountRwf: plan.amountRwf,
      demoActivated: activated,
    });
  } catch (e) {
    console.error('PAYMENT START ERROR:', e);
    return res.status(e.statusCode || 500).json({ error: e.message });
  }
});

app.post('/webhooks/:network', async (req, res) => {
  try {
    const network = String(req.params.network || '').toLowerCase();
    if (!['mtn', 'airtel'].includes(network)) {
      return res.status(400).json({ error: 'Unsupported payment network' });
    }

    const reference = req.body?.payment_reference || req.body?.paymentSessionId || req.body?.reference;
    const status = String(req.body?.status || '').toLowerCase();

    if (!reference) {
      return res.status(400).json({ error: 'payment_reference is required' });
    }

    if (['success', 'successful', 'paid', 'completed'].includes(status)) {
      const pkg = await activatePackage(reference);
      return res.json({ ok: true, active: true, package: pkg });
    }

    const { error } = await supabaseAdmin
      .from('user_packages')
      .update({ status: status || 'failed' })
      .eq('payment_reference', reference);

    if (error) throw error;
    return res.json({ ok: true, active: false });
  } catch (e) {
    return res.status(e.statusCode || 500).json({ error: e.message });
  }
});

app.get('/api/internal/free-exam/status', requireAuth, async (req, res) => {
  try {
    const phone = req.auth?.phone;
    if (!phone) return res.status(401).json({ error: 'Missing phone in token' });

    const { data, error } = await supabaseAdmin
      .from('exam_sessions')
      .select('id')
      .eq('phone', phone)
      .eq('plan', 'FREE_SAMPLE')
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true, alreadyTaken: !!data });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post('/api/internal/free-exam/complete', requireAuth, async (req, res) => {
  try {
    const phone = req.auth?.phone;
    if (!phone) return res.status(401).json({ error: 'Missing phone in token' });

    const { score, totalQuestions } = req.body || {};
    const now = new Date().toISOString();

    const { data: existing, error: existingErr } = await supabaseAdmin
      .from('exam_sessions')
      .select('id')
      .eq('phone', phone)
      .eq('plan', 'FREE_SAMPLE')
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle();

    if (existingErr) return res.status(500).json({ error: existingErr.message });
    if (existing) return res.json({ ok: true, alreadyCompleted: true });

    const sessionId = `fs_${phone}_${Date.now()}`;
    const { error: insErr } = await supabaseAdmin.from('exam_sessions').insert({
      id: sessionId,
      phone,
      plan: 'FREE_SAMPLE',
      status: 'completed',
      score: Number(score ?? 0),
      total_questions: Number(totalQuestions ?? 20),
      updated_at: now,
      completed_at: now,
      expires_at: null,
    });

    if (insErr) return res.status(500).json({ error: insErr.message });
    return res.json({ ok: true, alreadyCompleted: false });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get('/api/internal/active-package', requireAuth, async (req, res) => {
  try {
    const plan = getPlan(req.query.plan);
    const phone = req.auth?.phone;

    if (!plan) return res.status(400).json({ error: 'plan is required' });
    if (!phone) return res.status(401).json({ error: 'Missing phone in token' });

    const pkg = await findActivePackage(phone, plan.key);

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
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get('/api/internal/active-session', requireAuth, async (req, res) => {
  try {
    const plan = getPlan(req.query.plan);
    const phone = req.auth?.phone;

    if (!plan) return res.status(400).json({ error: 'plan is required' });

    const { data, error } = await supabaseAdmin
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
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post('/api/internal/start-exam', requireAuth, async (req, res) => {
  try {
    const plan = getPlan(req.body?.plan);
    const phone = req.auth?.phone;

    if (!plan) return res.status(400).json({ error: 'Unknown package' });
    if (!phone) return res.status(401).json({ error: 'Missing phone in token' });

    const activePackage = await findActivePackage(phone, plan.key);
    if (!activePackage) {
      return res.status(403).json({ error: 'No active package. Please buy a package.' });
    }

    const session = await createExamSession({
      phone,
      planKey: plan.key,
      userPackage: activePackage,
    });

    return res.json({ ok: true, sessionId: session.id, session });
  } catch (e) {
    return res.status(e.statusCode || 500).json({ error: e.message });
  }
});

app.get('/api/internal/session', requireAuth, async (req, res) => {
  try {
    const sessionId = String(req.query.sessionId || '');
    const phone = req.auth?.phone;

    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

    const { data, error } = await supabaseAdmin
      .from('exam_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('phone', phone)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Session not found' });
    if (data.status !== 'active') return res.status(409).json({ error: 'Session is already completed' });
    if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
      return res.status(410).json({ error: 'Session has expired' });
    }

    return res.json({ ok: true, session: data });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post('/api/internal/submit-exam', requireAuth, async (req, res) => {
  try {
    const phone = req.auth?.phone;
    const sessionId = String(req.body?.sessionId || '');
    const score = Number(req.body?.score ?? 0);
    const totalQuestions = Number(req.body?.totalQuestions ?? 20);

    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

    const { data: existing, error: readError } = await supabaseAdmin
      .from('exam_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('phone', phone)
      .limit(1)
      .maybeSingle();

    if (readError) throw readError;
    if (!existing) return res.status(404).json({ error: 'Session not found' });

    if (existing.status === 'completed') {
      return res.json({ ok: true, alreadySubmitted: true, session: existing });
    }

    const { data, error } = await supabaseAdmin
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
    return res.json({ ok: true, session: data });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get('/', (_req, res) => {
  res.json({
    message: 'Kora backend is running',
    status: 'OK',
    paymentMode,
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`kora-server running on port ${PORT}`);
});
