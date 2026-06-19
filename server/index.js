require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://kora-nine-phi.vercel.app',
  ],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
}

const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : createClient(supabaseUrl, supabaseAnonKey);

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const PLAN_MAP = {
  STARTER: { days: 3, exams: 10, unlimited: false },
  BASIC: { days: 5, exams: 15, unlimited: false },
  STANDARD: { days: 7, exams: 20, unlimited: false },
  MASTER: { days: 10, exams: 20, unlimited: false },
  PREMIUM: { days: 15, exams: 25, unlimited: false },
  PRO: { days: 30, exams: 50, unlimited: false },
  UNLIMITED: { days: null, exams: null, unlimited: true },
};

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';

  console.log('[AUTH]', req.method, req.path);
  let token = '';
  if (header.startsWith('Bearer ')) {
    token = header.replace('Bearer ', '');
  } else {
    try {
      token = localStorage?.getItem?.('kora-jwt') || '';
    } catch {
      token = '';
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}


/**
 * 405 HANDLERS
 */
function methodNotAllowed(req, res) {
  return res.status(405).json({
    error: `Method ${req.method} not allowed. Use POST.`,
  });
}

/**
 * PAYMENT START
 */
async function startPayment({ network, phone, packageKey, amountRwf }) {
  const paymentSessionId = `ps_${network}_${Date.now()}`;

  const { error } = await supabaseAdmin.from('user_packages').upsert({
    id: paymentSessionId,
    phone,
    package_key: packageKey,
    network,
    amount_rwf: amountRwf,
    status: 'pending',
    payment_reference: paymentSessionId,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;

  return paymentSessionId;
}

/**
 * PAYMENT ROUTES
 */
app.get('/api/payments/mtn/start', methodNotAllowed);
app.get('/api/payments/airtel/start', methodNotAllowed);

app.post('/api/payments/mtn/start', requireAuth, async (req, res) => {
  try {
    const { packageKey, amountRwf } = req.body;
    const phone = req.auth.phone;

    const id = await startPayment({
      network: 'mtn',
      phone,
      packageKey,
      amountRwf,
    });

    res.json({ ok: true, paymentSessionId: id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/payments/airtel/start', requireAuth, async (req, res) => {
  try {
    const { packageKey, amountRwf } = req.body;
    const phone = req.auth.phone;

    const id = await startPayment({
      network: 'airtel',
      phone,
      packageKey,
      amountRwf,
    });

    res.json({ ok: true, paymentSessionId: id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * HEALTH
 */
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

/**
 * Free exam endpoints (prevent frontend 404 reload loops)
 */
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

    // Idempotent: if already completed, do nothing
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

    const sessionId = `fs_${phone.replace(/[^0-9a-zA-Z@._-]/g, '')}_${Date.now()}`;

    const { error: insErr } = await supabaseAdmin.from('exam_sessions').upsert({
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

// Single source of truth for frontend polling: /api/internal/active-package
app.get('/api/internal/active-package', requireAuth, async (req, res) => {

  try {
    const plan = req.query.plan;
    const phone = req.auth?.phone;

    if (!plan) {
      return res.status(400).json({ error: 'plan is required' });
    }
    if (!phone) {
      return res.status(401).json({ error: 'Missing phone in token' });
    }

    const nowIso = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('user_packages')
      .select('*')
      .eq('phone', phone)
      .eq('package_key', plan)
      .eq('status', 'active')
      .or(`expires_at.gt.${nowIso},expires_at.is.null`)
      .order('activated_at', { ascending: false })
      .limit(1);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.json({ ok: true, active: false, remaining_attempts: 0 });
    }

    const pkg = data[0];
    return res.json({
      ok: true,
      active: true,
      remaining_attempts: pkg.unlimited ? 999999 : (pkg.remaining_attempts ?? 0),
      expires_at: pkg.expires_at,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * 404 JSON (IMPORTANT)
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl,
  });
});


/**
 * START SERVER
 */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`kora-server running on port ${PORT}`);
});