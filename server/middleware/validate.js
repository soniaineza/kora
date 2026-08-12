'use strict';

/**
 * Request validation middleware.
 *
 * Usage:
 *   router.post('/send-otp', validate({ body: { phone: v.phone } }), handler)
 *
 * Each field maps to a validator function from utils/validators. Sanitized and
 * validated values replace req.body so downstream handlers can trust them.
 */

const ApiError = require('../utils/ApiError');
const { sanitizeObject } = require('../utils/sanitizer');

/**
 * @param {Object} schema
 * @param {Object} [schema.body] map of field -> validator
 * @param {Object} [schema.query] map of query param -> validator
 * @param {Object} [schema.params] map of path param -> validator
 * @returns {Function} express middleware
 */
function validate(schema = {}) {
  return function validationMiddleware(req, _res, next) {
    try {
      if (schema.body) {
        req.body = sanitizeObject(req.body || {});
        req.body = applySchema(req.body, schema.body);
      }
      if (schema.query) {
        req.query = applySchema(req.query || {}, schema.query);
      }
      if (schema.params) {
        req.params = applySchema(req.params || {}, schema.params);
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

function applySchema(source, fieldMap) {
  // Start from the (sanitized) source so unknown/extra fields survive, then
  // override the fields the schema declares with their validated values.
  const out = { ...source };
  for (const [field, validator] of Object.entries(fieldMap)) {
    const value = source[field];
    if (value === undefined) {
      // Optional validators return undefined without erroring.
      try {
        out[field] = validator(undefined);
      } catch (err) {
        if (err instanceof ApiError) {
          throw ApiError.badRequest(`${field} is required`);
        }
        throw err;
      }
    } else {
      out[field] = validator(value);
    }
  }
  return out;
}

module.exports = { validate };
