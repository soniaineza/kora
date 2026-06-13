require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(cors({ origin: true, credentials: true }));
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

if (!supabaseServiceRoleKey) {
  console.warn('Missing SUPABASE_SERVICE_ROLE_KEY. Some endpoints will fail until set.');
}

const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : createClient(supabaseUrl, supabaseAnonKey);

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

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
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    console.log('[AUTH] Missing token');
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    return next();
  } catch (err) {
    console.log('[AUTH] Invalid token', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireAuthOrFail(res, header) {
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  return null;
}

function getActiveSessionForUser({ phone, plan }) {
  let q = supabaseAdmin
    .from('exam_sessions')
    .select('*')
    .eq('phone', phone)
    .eq('status', 'active');

  if (plan) q = q.eq('plan', plan);

  return q
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
}

// Resume helper endpoint (used by /exams package-screen resume button)
app.get('/api/internal/active-session', requireAuth, async (req, res) => {
  try {
    const plan = req.query.plan;
    const phone = req.auth?.phone;

    if (!phone) return res.status(401).json({ error: 'Missing phone in token' });
    if (!plan) return res.status(400).json({ error: 'plan is required' });

    const { data, error } = await getActiveSessionForUser({ phone, plan });
    if (error) return res.status(500).json({ error: error.message });

    return res.json({ ok: true, session: data || null });
  } catch (e) {
    return res.status(500).json({ error: `Server error: ${e.message}` });
  }
});


function normalizePhone(phone) {
  const cleaned = String(phone || '').replace(/\D/g, '');
  return cleaned ? `${cleaned}@kora.rw` : 'user@kora.rw';
}
function requireAdminDemo(req, res, next) {
  const demoHeader = String(req.headers['x-admin-demo'] || '');
  if (demoHeader !== '1') return res.status(403).json({ error: 'Admin demo header missing' });

  const allowPath = path.join(__dirname, 'admin_demo_allowlist.txt');
  let allowRaw = '';
  try {
    allowRaw = fs.readFileSync(allowPath, 'utf8');
  } catch {

  }
  const allowPhones = allowRaw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith('#'))
    .map((p) => normalizePhone(p).toLowerCase());
  const phone = normalizePhone(req.auth?.phone || '').toLowerCase();
  if (allowPhones.length === 0) return next();

  if (!phone || !allowPhones.includes(phone)) {
    return res.status(403).json({ error: 'Not in admin allowlist' });
  }
  return next();
}
app.post('/api/otp/send', async (req, res) => {
  const { phone } = req.body || {};
  if (!phone) return res.status(400).json({ error: 'phone is required' });
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  const emailLike = normalizePhone(phone);

  const { error } = await supabaseAdmin
    .from('phone_verifications')
    .upsert(
      {
        phone: emailLike,
        code,
        expires_at: expiresAt,
        verified_at: null,
        purpose: 'registration',
      },
      { onConflict: 'phone' }
    );

  if (error) return res.status(500).json({ error: error.message });
  console.log(`[OTP SEND] phone=${phone} code=${code}`);

  return res.json({ ok: true, expiresAt });
});

app.post('/api/otp/verify', async (req, res) => {
  const { phone, code } = req.body || {};
  if (!phone || !code) return res.status(400).json({ error: 'phone and code are required' });

  const emailLike = normalizePhone(phone);

  const { data, error } = await supabaseAdmin
    .from('phone_verifications')
    .select('*')
    .eq('phone', emailLike)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(400).json({ error: 'No OTP found. Please resend.' });

  // DEMO BEHAVIOR: allow any 6-digit code to pass verification.
  // Still ensure the OTP row exists and is not expired, otherwise users are blocked.
  const now = Date.now();
  if (!data.code) {
    return res.status(400).json({ error: 'No OTP found. Please resend.' });
  }
  if (new Date(data.expires_at).getTime() < now) {
    return res.status(400).json({ error: 'Code expired. Please resend.' });
  }
  const { error: updErr } = await supabaseAdmin
    .from('phone_verifications')
    .update({ verified_at: new Date().toISOString() })
    .eq('phone', emailLike);

  if (updErr) return res.status(500).json({ error: updErr.message });
  const token = jwt.sign({ phone: emailLike }, JWT_SECRET, { expiresIn: '24h' });

  return res.json({ ok: true, token });
});

async function startPayment({ network, phone, packageKey, amountRwf }) {
  
  const paymentSessionId = `ps_${network}_${Date.now()}`;

  const { error } = await supabaseAdmin.from('user_packages').upsert(
    {
      id: paymentSessionId,
      phone,
      package_key: packageKey,
      network,
      amount_rwf: amountRwf,
      status: 'pending',
      payment_reference: paymentSessionId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (error) throw error;

  return paymentSessionId;
}

app.post('/api/payments/mtn/start', requireAuth, async (req, res) => {
  const { packageKey, amountRwf } = req.body || {};
  const phone = req.auth?.phone;
  if (!phone) return res.status(401).json({ error: 'Missing phone in token' });

  try {
    const paymentSessionId = await startPayment({ network: 'mtn', phone, packageKey, amountRwf });
    return res.json({ ok: true, paymentSessionId });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post('/api/payments/airtel/start', requireAuth, async (req, res) => {
  const { packageKey, amountRwf } = req.body || {};
  const phone = req.auth?.phone;
  if (!phone) return res.status(401).json({ error: 'Missing phone in token' });

  try {
    const paymentSessionId = await startPayment({ network: 'airtel', phone, packageKey, amountRwf });
    return res.json({ ok: true, paymentSessionId });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Webhooks (provider-specific payload mapping required)
async function activatePackage(paymentReference, status) {
  const newStatus = status === 'success' ? 'active' : 'failed';

  // If success, we need to find the package info and set attempts/expiry
  if (status === 'success') {
    const { data: pkgRow, error: fetchErr } = await supabaseAdmin
      .from('user_packages')
      .select('*')
      .eq('payment_reference', paymentReference)
      .maybeSingle();

    if (fetchErr || !pkgRow) throw new Error('Package not found');

    const def = PLAN_MAP[pkgRow.package_key];
    if (!def) throw new Error('Invalid package key');

    const activatedAt = new Date();
    const expiresAt = def.days ? new Date(activatedAt.getTime() + def.days * 24 * 60 * 60 * 1000) : null;

    const { error: updErr } = await supabaseAdmin
      .from('user_packages')
      .update({
        status: 'active',
        activated_at: activatedAt.toISOString(),
        expires_at: expiresAt ? expiresAt.toISOString() : null,
        remaining_attempts: def.exams,
        unlimited: def.unlimited,
        updated_at: new Date().toISOString(),
      })
      .eq('payment_reference', paymentReference);

    if (updErr) throw updErr;
  } else {
    const { error: updErr } = await supabaseAdmin
      .from('user_packages')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('payment_reference', paymentReference);

    if (updErr) throw updErr;
  }
}

app.post('/webhooks/mtn', async (req, res) => {
  const payload = req.body;
  console.log('[WEBHOOK MTN]', payload);

  const paymentReference = payload.payment_reference;
  const status = payload.status; // 'success'|'failed'

  if (!paymentReference) return res.status(400).json({ error: 'payment_reference missing' });

  try {
    await activatePackage(paymentReference, status);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post('/webhooks/airtel', async (req, res) => {
  const payload = req.body;
  console.log('[WEBHOOK AIRTEL]', payload);

  const paymentReference = payload.payment_reference;
  const status = payload.status;

  if (!paymentReference) return res.status(400).json({ error: 'payment_reference missing' });

  try {
    await activatePackage(paymentReference, status);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ----------------------------
// Routes
// ----------------------------
app.get('/', (req, res) => {
  res.status(200).send('kora-server is running');
});

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Plan definitions
app.get('/api/internal/package-def', requireAuth, async (req, res) => {
  const plan = req.query.plan;

  if (!plan || !PLAN_MAP[plan]) {
    return res.status(400).json({ error: 'Unknown plan' });
  }

  const def = PLAN_MAP[plan];
  res.json({ ok: true, plan, days: def.days, exams: def.exams });
});

// Server-side attempt enforcement
app.post('/api/internal/start-exam', requireAuth, async (req, res) => {
  try {
    const { plan } = req.body || {};
    if (!plan) return res.status(400).json({ error: 'plan is required' });

    const phone = req.auth?.phone;
    if (!phone) return res.status(401).json({ error: 'Missing phone in token' });

    console.log(`[START-EXAM] phone=${phone} plan=${plan}`);

    const nowIso = new Date().toISOString();
    const sessionId = `es_${phone.replace(/[^0-9a-zA-Z@._-]/g, '')}_${plan}_${Date.now()}`;

    // Fetch active package row
    const { data: pkgs, error: pkgErr } = await supabaseAdmin
      .from('user_packages')
      .select('*')
      .eq('phone', phone)
      .eq('package_key', plan)
      .eq('status', 'active')
      .or(`expires_at.gt.${nowIso},expires_at.is.null`)
      .order('activated_at', { ascending: false })
      .limit(1);

    if (pkgErr) {
      console.error('[START-EXAM] pkg fetch error:', pkgErr);
      return res.status(500).json({ error: pkgErr.message });
    }
    
    if (!pkgs || pkgs.length === 0) {
      console.log('[START-EXAM] No active package found');
      return res.json({ ok: true, active: false });
    }

    const pkg = pkgs[0];
    const remaining = pkg.remaining_attempts ?? 0;

    // Decrement attempts if not unlimited
    if (!pkg.unlimited && remaining <= 0) {
      console.log('[START-EXAM] No attempts left');
      return res.status(402).json({ error: 'No remaining attempts. Upgrade or buy again.' });
    }

    const { error: sessErr } = await supabaseAdmin
      .from('exam_sessions')
      .upsert(
        {
          id: sessionId,
          phone,
          plan,
          status: 'active',
          expires_at: pkg.expires_at || null,
          user_package_id: pkg.id,
        },
        { onConflict: 'id' }
      );

    if (sessErr) {
      console.error('[START-EXAM] session upsert error:', sessErr);
      return res.status(500).json({ error: sessErr.message });
    }

    let remainingAfter = remaining;
    if (!pkg.unlimited) {
      const { error: updErr } = await supabaseAdmin
        .from('user_packages')
        .update({
          remaining_attempts: remaining - 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pkg.id);

      if (updErr) {
        console.error('[START-EXAM] update attempts error:', updErr);
        return res.status(500).json({ error: updErr.message });
      }
      remainingAfter = remaining - 1;
    }

    return res.json({ ok: true, remaining_attempts: remainingAfter, sessionId });
  } catch (err) {
    console.error('[START-EXAM] global error:', err);
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

// Validate session for quiz rendering (prevents bypass)
app.get('/api/internal/session', requireAuth, async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

  const phone = req.auth?.phone;
  if (!phone) return res.status(401).json({ error: 'Missing phone in token' });

  const { data, error } = await supabaseAdmin
    .from('exam_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('phone', phone)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(410).json({ error: 'Invalid or inactive session' });

  const nowIso = new Date().toISOString();
  if (data.expires_at && new Date(data.expires_at).getTime() < new Date(nowIso).getTime()) {
    return res.status(410).json({ error: 'Session expired. Please start again.' });
  }

  return res.json({ ok: true, session: data });
});

// Free exam: allow exactly once per account (phone)
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

    return res.json({
      ok: true,
      alreadyTaken: !!data,
    });
  } catch (e) {
    return res.status(500).json({ error: `Server error: ${e.message}` });
  }
});

app.post('/api/internal/free-exam/complete', requireAuth, async (req, res) => {
  try {
    const phone = req.auth?.phone;
    if (!phone) return res.status(401).json({ error: 'Missing phone in token' });

    const { score, totalQuestions } = req.body || {};
    const now = new Date().toISOString();

    // If already completed, do nothing (idempotent)
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
    return res.status(500).json({ error: `Server error: ${e.message}` });
  }
});


app.post('/api/internal/submit-exam', requireAuth, async (req, res) => {
  const { sessionId, score, totalQuestions } = req.body || {};
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

  const phone = req.auth?.phone;
  if (!phone) return res.status(401).json({ error: 'Missing phone in token' });

  const { error } = await supabaseAdmin
    .from('exam_sessions')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('phone', phone);

  if (error) return res.status(500).json({ error: error.message });

  console.log(`[EXAM SUBMIT] phone=${phone} sessionId=${sessionId} score=${score}/${totalQuestions}`);

  return res.json({ ok: true });
});

app.get('/api/internal/active-package', requireAuth, async (req, res) => {
  try {
    const plan = req.query.plan;
    if (!plan) return res.status(400).json({ error: 'plan is required' });

    const phone = req.auth?.phone;
    if (!phone) return res.status(401).json({ error: 'Missing phone in token' });

    console.log(`[ACTIVE-PACKAGE] phone=${phone} plan=${plan}`);

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
      console.error('[ACTIVE-PACKAGE] error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      console.log('[ACTIVE-PACKAGE] No active package found');
      return res.json({ ok: true, active: false });
    }

    const pkg = data[0];
    console.log('[ACTIVE-PACKAGE] Found active package:', pkg.id);
    return res.json({
      ok: true,
      active: true,
      // For unlimited plans, attempts are effectively infinite.
      // Use 999999 to match the frontend display logic.
      remaining_attempts: pkg.unlimited ? 999999 : (pkg.remaining_attempts ?? 0),
      expires_at: pkg.expires_at,
    });
  } catch (err) {
    console.error('[ACTIVE-PACKAGE] global error:', err);
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

// ----------------------------
// Admin dashboards (demo protected)
// ----------------------------
app.get('/api/admin/package-sales', requireAuth, requireAdminDemo, async (req, res) => {
  const { data: rows, error } = await supabaseAdmin
    .from('user_packages')
    .select('package_key, status')
    .eq('status', 'active');

  if (error) return res.status(500).json({ error: error.message });

  const byPlan = {};
  for (const r of rows || []) {
    byPlan[r.package_key] = (byPlan[r.package_key] || 0) + 1;
  }

  return res.json({
    ok: true,
    salesByPackageKey: byPlan,
    totalActivePackages: (rows || []).length,
  });
});

app.get('/api/admin/exam-session-counts', requireAuth, requireAdminDemo, async (req, res) => {
  const { data: rows, error } = await supabaseAdmin
    .from('exam_sessions')
    .select('plan, status')
    .eq('status', 'active');

  if (error) return res.status(500).json({ error: error.message });

  const byPlan = {};
  for (const r of rows || []) {
    byPlan[r.plan] = (byPlan[r.plan] || 0) + 1;
  }

  return res.json({
    ok: true,
    examSessionsByPlan: byPlan,
    totalActiveSessions: (rows || []).length,
  });
});

app.get('/api/admin/most-popular', requireAuth, requireAdminDemo, async (req, res) => {
  const { data: rows, error } = await supabaseAdmin
    .from('user_packages')
    .select('package_key, status')
    .eq('status', 'active');

  if (error) return res.status(500).json({ error: error.message });

  const counts = {};
  for (const r of rows || []) {
    counts[r.package_key] = (counts[r.package_key] || 0) + 1;
  }

  let bestKey = null;
  let bestCount = -1;
  for (const [k, v] of Object.entries(counts)) {
    if (v > bestCount) {
      bestCount = v;
      bestKey = k;
    }
  }

  // Required mapping: 3000frw package is PREMIUM
  const MOST_POPULAR_PRICE_RWF = bestKey === 'PREMIUM' ? 3000 : null;

  return res.json({
    ok: true,
    mostPopularPackageKey: bestKey,
    mostPopularCount: bestCount,
    mostPopularPriceRwf: MOST_POPULAR_PRICE_RWF,
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`kora-server running on port ${PORT}`);
});

