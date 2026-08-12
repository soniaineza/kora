'use strict';

/**
 * /api/notifications routes. All protected by JWT.
 */

const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const notificationController = require('../controllers/notificationController');
const v = require('../utils/validators');

router.use(requireAuth);

router.post(
  '/send',
  validate({
    body: {
      type: v.stringField,
      phone: v.phone,
    },
  }),
  notificationController.send
);

router.get(
  '/',
  validate({
    query: {
      limit: (value) => (value === undefined ? undefined : v.numberField(value, 'limit', { min: 1, max: 200 })),
      offset: (value) => (value === undefined ? undefined : v.numberField(value, 'offset', { min: 0 })),
    },
  }),
  notificationController.list
);

module.exports = router;
