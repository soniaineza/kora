'use strict';

/**
 * Admin Payment Dashboard Controller
 * Provides payment statistics and analytics for admin users.
 */

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getSupabaseAdmin } = require('../database/supabase');
const logger = require('../utils/logger');
const paymentService = require('../services/paymentService');
const packageService = require('../services/packageService');

/**
 * GET /api/admin/payments/orders?status=pending
 * List orders (transactions) for the given status (default all).
 */
const getPendingOrders = asyncHandler(async (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query;

  let query = getSupabaseAdmin()
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Number(limit))
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;

  res.json({ ok: true, orders: data || [] });
});

/**
 * POST /api/admin/payments/activate
 * Activate a pending order manually. Body: { txRef }
 */
const activateOrder = asyncHandler(async (req, res) => {
  const { txRef } = req.body;
  if (!txRef) throw ApiError.badRequest('Missing order reference');

  const result = await paymentService.applyManualActivation({
    txRef,
    activatedBy: req.auth?.userId || 'admin',
  });

  res.json({ ok: true, ...result });
});

/**
 * POST /api/admin/payments/cancel
 * Cancel/reject a pending order. Body: { txRef }
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const { txRef } = req.body;
  if (!txRef) throw ApiError.badRequest('Missing order reference');

  const result = await paymentService.cancelOrder({
    txRef,
    reason: req.body?.reason,
  });

  res.json({ ok: true, ...result });
});

/**
 * GET /api/admin/package-sales
 * Sales and revenue grouped by package (successful orders only).
 * Returned under both `sales` and `data` for the existing admin pages.
 */
const getPackageSales = asyncHandler(async (req, res) => {
  const { data, error } = await getSupabaseAdmin()
    .from('transactions')
    .select('package_key, amount_rwf')
    .eq('status', 'successful');

  if (error) throw error;

  const sales = [];
  const byPackage = {};
  (data || []).forEach((tx) => {
    const key = tx.package_key;
    byPackage[key] = byPackage[key] || { count: 0, revenue: 0 };
    byPackage[key].count += 1;
    byPackage[key].revenue += tx.amount_rwf || 0;
  });

  Object.entries(byPackage).forEach(([package_key, s]) => {
    sales.push({ package_key, count: s.count, revenue: s.revenue, total_revenue: s.revenue });
  });

  sales.sort((a, b) => b.revenue - a.revenue);

  res.json({
    ok: true,
    sales,
    data: sales.map((s) => ({ package_key: s.package_key, count: s.count, total_revenue: s.total_revenue })),
  });
});

/**
 * GET /api/admin/exam-session-counts
 * Exam session counts per plan.
 */
const getExamSessionCounts = asyncHandler(async (req, res) => {
  const { data, error } = await getSupabaseAdmin()
    .from('exam_sessions')
    .select('plan');

  if (error) throw error;

  const counts = {};
  (data || []).forEach((s) => {
    counts[s.plan] = (counts[s.plan] || 0) + 1;
  });

  const rows = Object.entries(counts)
    .map(([plan, count]) => ({ plan, count }))
    .sort((a, b) => b.count - a.count);

  res.json({
    ok: true,
    data: rows,
    counts: rows.map((r) => ({ count: r.count })),
  });
});

/**
 * GET /api/admin/most-popular
 * The most purchased package.
 */
const getMostPopular = asyncHandler(async (req, res) => {
  const { data, error } = await getSupabaseAdmin()
    .from('transactions')
    .select('package_key')
    .eq('status', 'successful');

  if (error) throw error;

  const counts = {};
  (data || []).forEach((tx) => {
    counts[tx.package_key] = (counts[tx.package_key] || 0) + 1;
  });

  const entries = Object.entries(counts);
  if (entries.length === 0) {
    return res.json({ ok: true, data: null });
  }

  const best = entries.sort((a, b) => b[1] - a[1])[0];
  const plan = packageService.getPlan(best[0]);

  res.json({
    ok: true,
    data: {
      package_key: best[0],
      count: best[1],
      price_rwf: plan?.amountRwf ?? 0,
    },
  });
});

/**
 * GET /api/admin/payments/stats
 * Get payment statistics.
 */
const getPaymentStats = asyncHandler(async (req, res) => {
  const { data: totals, error: totalsError } = await getSupabaseAdmin()
    .from('transactions')
    .select('status, amount_rwf', { count: 'exact' });

  if (totalsError) throw totalsError;

  const stats = {
    total: totals?.length || 0,
    successful: totals?.filter(t => t.status === 'successful').length || 0,
    failed: totals?.filter(t => t.status === 'failed').length || 0,
    pending: totals?.filter(t => t.status === 'pending').length || 0,
    cancelled: totals?.filter(t => t.status === 'cancelled').length || 0,
    totalRevenue: totals
      ?.filter(t => t.status === 'successful')
      ?.reduce((sum, t) => sum + (t.amount_rwf || 0), 0) || 0,
    todayRevenue: 0,
    thisMonthRevenue: 0,
  };

  // Today's revenue
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { data: todayTx, error: todayError } = await getSupabaseAdmin()
    .from('transactions')
    .select('amount_rwf')
    .eq('status', 'successful')
    .gte('created_at', todayStart.toISOString());
  if (!todayError && todayTx) {
    stats.todayRevenue = todayTx.reduce((sum, t) => sum + (t.amount_rwf || 0), 0);
  }

  // This month's revenue
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const { data: monthTx, error: monthError } = await getSupabaseAdmin()
    .from('transactions')
    .select('amount_rwf')
    .eq('status', 'successful')
    .gte('created_at', monthStart.toISOString());
  if (!monthError && monthTx) {
    stats.thisMonthRevenue = monthTx.reduce((sum, t) => sum + (t.amount_rwf || 0), 0);
  }

  res.json({ ok: true, stats });
});

/**
 * GET /api/admin/payments/subscriptions
 * Get subscription statistics.
 */
const getSubscriptionStats = asyncHandler(async (req, res) => {
  const { data, error } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('status, package_key', { count: 'exact' });

  if (error) throw error;

  const stats = {
    total: data?.length || 0,
    active: data?.filter(s => s.status === 'active').length || 0,
    expired: data?.filter(s => s.status === 'expired').length || 0,
    cancelled: data?.filter(s => s.status === 'cancelled').length || 0,
    byPackage: {},
  };

  if (data) {
    for (const s of data) {
      stats.byPackage[s.package_key] = (stats.byPackage[s.package_key] || 0) + 1;
    }
  }

  res.json({ ok: true, stats });
});

/**
 * GET /api/admin/payments/revenue/daily
 * Get daily revenue for the last N days.
 */
const getDailyRevenue = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const { data, error } = await getSupabaseAdmin()
    .from('transactions')
    .select('created_at, amount_rwf')
    .eq('status', 'successful')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Group by day
  const daily = {};
  if (data) {
    for (const tx of data) {
      const day = new Date(tx.created_at).toISOString().split('T')[0];
      daily[day] = (daily[day] || 0) + (tx.amount_rwf || 0);
    }
  }

  // Fill missing days with 0
  const result = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().split('T')[0];
    result.unshift({ date: dayStr, revenue: daily[dayStr] || 0 });
  }

  res.json({ ok: true, dailyRevenue: result });
});

/**
 * GET /api/admin/payments/revenue/monthly
 * Get monthly revenue.
 */
const getMonthlyRevenue = asyncHandler(async (req, res) => {
  const months = Number(req.query.months) || 12;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const { data, error } = await getSupabaseAdmin()
    .from('transactions')
    .select('created_at, amount_rwf')
    .eq('status', 'successful')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) throw error;

  const monthly = {};
  if (data) {
    for (const tx of data) {
      const dt = new Date(tx.created_at);
      const monthKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      monthly[monthKey] = (monthly[monthKey] || 0) + (tx.amount_rwf || 0);
    }
  }

  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    d.setDate(1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    result.push({ month: monthKey, revenue: monthly[monthKey] || 0 });
  }

  res.json({ ok: true, monthlyRevenue: result });
});

/**
 * GET /api/admin/payments/packages/popular
 * Get most popular packages by purchase count.
 */
const getPopularPackages = asyncHandler(async (req, res) => {
  const { data, error } = await getSupabaseAdmin()
    .from('transactions')
    .select('package_key')
    .eq('status', 'successful');

  if (error) throw error;

  const counts = {};
  if (data) {
    for (const tx of data) {
      counts[tx.package_key] = (counts[tx.package_key] || 0) + 1;
    }
  }

  const sorted = Object.entries(counts)
    .map(([package_key, count]) => ({ package_key, count }))
    .sort((a, b) => b.count - a.count);

  res.json({ ok: true, packages: sorted });
});

/**
 * GET /api/admin/payments/failed
 * Get failed payments for investigation.
 */
const getFailedPayments = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;

  const { data, error } = await getSupabaseAdmin()
    .from('transactions')
    .select('*')
    .eq('status', 'failed')
    .order('created_at', { ascending: false })
    .limit(Number(limit))
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (error) throw error;

  res.json({ ok: true, failed: data || [] });
});

/**
 * GET /api/admin/payments/duplicates
 * Get duplicate payment attempts.
 */
const getDuplicatePayments = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;

  // Find tx_refs that appear more than once
  const { data, error } = await getSupabaseAdmin()
    .from('transactions')
    .select('tx_ref')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const txRefCounts = {};
  if (data) {
    for (const tx of data) {
      txRefCounts[tx.tx_ref] = (txRefCounts[tx.tx_ref] || 0) + 1;
    }
  }

  const duplicates = Object.entries(txRefCounts)
    .filter(([, count]) => count > 1)
    .map(([tx_ref, count]) => ({ tx_ref, count }))
    .sort((a, b) => b.count - a.count)
    .slice(Number(offset), Number(offset) + Number(limit));

  res.json({ ok: true, duplicates, total: Object.keys(txRefCounts).filter(k => txRefCounts[k] > 1).length });
});

/**
 * GET /api/admin/payments/recent
 * Get recent transactions.
 */
const getRecentTransactions = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, status } = req.query;

  let query = getSupabaseAdmin()
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Number(limit))
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;

  res.json({ ok: true, transactions: data || [] });
});

module.exports = {
  getPaymentStats,
  getSubscriptionStats,
  getDailyRevenue,
  getMonthlyRevenue,
  getPopularPackages,
  getFailedPayments,
  getDuplicatePayments,
  getRecentTransactions,
  getPendingOrders,
  activateOrder,
  cancelOrder,
  getPackageSales,
  getExamSessionCounts,
  getMostPopular,
};