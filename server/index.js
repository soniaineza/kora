require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();

/**
 * CORS
 */
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://kora-nine-phi.vercel.app',
  ],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

/**
 * Logger
 */
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

/**
 * ENV CHECK
 */
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

/**
 * PLAN MAP
 */
const PLAN_MAP = {
  STARTER: { days: 3, exams: 10, unlimited: false },
  BASIC: { days: 5, exams: 15, unlimited: false },
  STANDARD: { days: 7, exams: 20, unlimited: false },
  MASTER: { days: 10, exams: 20, unlimited: false },
  PREMIUM: { days: 15, exams: 25, unlimited: false },
  PRO: { days: 30, exams: 50, unlimited: false },
  UNLIMITED: { days: null, exams: null, unlimited: true },
};

/**
 * AUTH MIDDLEWARE (FIXED)
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';

  console.log('[AUTH]', req.method, req.path);

  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const token = header.replace('Bearer ', '');

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