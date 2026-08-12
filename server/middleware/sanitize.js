'use strict';

/**
 * Global input sanitization middleware. Trims and strips control characters
 * from all incoming request strings before they reach handlers.
 */

const { sanitizeObject } = require('../utils/sanitizer');

function sanitizeRequest(req, _res, next) {
  try {
    if (req.body && typeof req.body === 'object') req.body = sanitizeObject(req.body);
    if (req.query && typeof req.query === 'object') req.query = sanitizeObject(req.query);
    if (req.params && typeof req.params === 'object') req.params = sanitizeObject(req.params);
  } catch (_err) {
    // Sanitization is best-effort; never block a request because of it.
  }
  next();
}

module.exports = { sanitizeRequest };
