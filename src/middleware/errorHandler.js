// src/middleware/errorHandler.js
const ApiError = require('../utils/errors').ApiError;

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.statusCode
      }
    });
  }

  // Handle axios errors
  if (err.isAxiosError) {
    return res.status(502).json({
      error: {
        message: 'Bad gateway - External API error',
        code: 502
      }
    });
  }

  // Default error
  res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 500
    }
  });
};
module.exports = errorHandler;