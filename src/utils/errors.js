// src/utils/errors.js
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode || 500;
    Error.captureStackTrace(this, this.constructor);
  }
}

class SwapiError extends ApiError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.name = 'SwapiError';
  }
}

class ValidationError extends ApiError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

module.exports = {
  ApiError,
  SwapiError,
  ValidationError
};