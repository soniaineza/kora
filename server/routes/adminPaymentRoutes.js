'use strict';

/**
 * Admin Payment Routes
 * Protected admin routes for payment dashboard.
 */

const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const adminPaymentController = require('../controllers/adminPaymentController');

// All routes require auth + admin check
// Admin check is done via header x-admin-demo: 1 (existing pattern)
function requireAdmin(req, res, next) {
  if (req.headers['x-admin-demo'] !== '1') {
    return res.status(403).json({ ok: false, error: 'Admin access required' });
  }
  next();
}

router.use(requireAuth);
router.use(requireAdmin);

router.get('/stats', adminPaymentController.getPaymentStats);
router.get('/subscriptions', adminPaymentController.getSubscriptionStats);
router.get('/revenue/daily', adminPaymentController.getDailyRevenue);
router.get('/revenue/monthly', adminPaymentController.getMonthlyRevenue);
router.get('/packages/popular', adminPaymentController.getPopularPackages);
router.get('/failed', adminPaymentController.getFailedPayments);
router.get('/duplicates', adminPaymentController.getDuplicatePayments);
router.get('/recent', adminPaymentController.getRecentTransactions);
router.get('/orders', adminPaymentController.getPendingOrders);
router.post('/activate', adminPaymentController.activateOrder);
router.post('/cancel', adminPaymentController.cancelOrder);

// Analytics endpoints used by the web admin pages
router.get('/package-sales', adminPaymentController.getPackageSales);
router.get('/exam-session-counts', adminPaymentController.getExamSessionCounts);
router.get('/most-popular', adminPaymentController.getMostPopular);

module.exports = router;