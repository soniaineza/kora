'use strict';

/**
 * Operational error with an HTTP status code.
 * Errors without this shape are treated as 500 Internal Server Error.
 */

class ApiError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }

  static badRequest(message, details) {
    return new ApiError(message, 400, details);
  }

  static unauthorized(message) {
    return new ApiError(message || 'Authentication required', 401);
  }

  static forbidden(message) {
    return new ApiError(message || 'Forbidden', 403);
  }

  static notFound(message) {
    return new ApiError(message || 'Not found', 404);
  }

  static conflict(message, details) {
    return new ApiError(message, 409, details);
  }

  static tooManyRequests(message) {
    return new ApiError(message || 'Too many requests', 429);
  }

  static badGateway(message) {
    return new ApiError(message || 'Bad gateway', 502);
  }

  static serviceUnavailable(message) {
    return new ApiError(message || 'Service unavailable', 503);
  }
}

module.exports = ApiError;
