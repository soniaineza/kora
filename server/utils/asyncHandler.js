'use strict';

/**
 * Wraps an async route handler so rejected promises are forwarded to the
 * central error-handling middleware instead of crashing the process.
 *
 * @param {Function} fn async (req, res, next) => Promise
 * @returns {Function}
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
