// src/utils/errors.js

class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class SwapiError extends ApiError {
  constructor(message, statusCode = 502) {
    // default 502 for external API errors
    super(message, statusCode);
    this.name = "SwapiError";
  }
}

class ValidationError extends ApiError {
  constructor(message) {
    super(message, 400); // always 400
    this.name = "ValidationError";
  }
}

module.exports = {
  ApiError,
  SwapiError,
  ValidationError,
};
