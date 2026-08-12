'use strict';

/**
 * /api/sms routes. All protected by JWT.
 */

const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const smsController = require('../controllers/smsController');
const v = require('../utils/validators');

router.use(requireAuth);

router.post(
  '/send',
  validate({
    body: {
      to: v.phone,
      message: v.stringField,
      from: v.stringOptional,
    },
  }),
  smsController.send
);

router.get(
  '/logs',
  validate({
    query: {
      phone: v.stringOptional,
      limit: (value) => (value === undefined ? undefined : v.numberField(value, 'limit', { min: 1, max: 200 })),
      offset: (value) => (value === undefined ? undefined : v.numberField(value, 'offset', { min: 0 })),
    },
  }),
  smsController.getLogs
);

module.exports = router;
