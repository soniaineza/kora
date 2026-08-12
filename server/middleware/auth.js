'use strict';

/**
 * JWT authentication middleware. Attaches the decoded payload to req.auth.
 */

const authService = require('../services/authService');

function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  try {
    req.auth = authService.verifyToken(token);
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { requireAuth };
