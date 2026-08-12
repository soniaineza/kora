'use strict';

/**
 * Central error handling. Distinguishes operational ApiErrors from unexpected
 * exceptions, which are logged at error level.
 */

const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

function errorHandler(err, req, res, _next) {
  const status = err instanceof ApiError ? err.statusCode : err.status || 500;
  const payload = {
    ok: false,
    error: err.isOperational ? err.message : 'Internal Server Error',
  };

  if (err instanceof ApiError && err.details !== undefined) {
    payload.details = err.details;
  }

  if (status >= 500) {
    logger.error('Unhandled exception', {
      method: req.method,
      url: req.url,
      error: err.message,
      stack: err.stack,
    });
  } else {
    logger.warn('Request error', {
      method: req.method,
      url: req.url,
      status,
      error: err.message,
    });
  }

  res.status(status).json(payload);
}

module.exports = errorHandler;
