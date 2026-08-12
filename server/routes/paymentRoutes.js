'use strict';

/**
 * Payment Routes
 * Mixed public and protected routes for manual orders and subscriptions.
 */

const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const v = require('../utils/validators');
const paymentController = require('../controllers/paymentController');

// Public route - get available packages
router.get('/packages', paymentController.getPackages);

// Protected routes
router.use(requireAuth);

router.post(
  '/initiate',
  validate({
    body: {
      packageKey: v.stringField,
    },
  }),
  paymentController.initiatePayment
);

router.post(
  '/paypack/start',
  validate({
    body: {
      packageKey: v.stringField,
      phone: v.stringOptional,
    },
  }),
  paymentController.startPaypackPayment
);

router.get('/order/:txRef', paymentController.getOrderStatus);

router.get('/history', paymentController.getPaymentHistory);

router.get('/subscription', paymentController.getActiveSubscription);

router.get('/subscriptions', paymentController.getSubscriptions);

module.exports = router;
