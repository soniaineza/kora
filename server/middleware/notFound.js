'use strict';

/** 404 handler for unmatched routes. */
function notFound(req, res) {
  res.status(404).json({ ok: false, error: `Route not found: ${req.method} ${req.path}` });
}

module.exports = notFound;
