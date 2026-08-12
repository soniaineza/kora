'use strict';

/**
 * Request logger. Logs one line per request with method, url, status and
 * duration once the response finishes.
 */

const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const startedAt = Date.now();
  res.on('finish', () => {
    logger.info('http', {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
      ip: req.ip,
    });
  });
  next();
}

module.exports = requestLogger;
