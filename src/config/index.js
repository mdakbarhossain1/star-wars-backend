    // src/config/index.js
import dotenv from 'dotenv';
dotenv.config();

const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API configuration
  swapiBaseUrl: process.env.SWAPI_BASE_URL || 'https://www.swapi.tech/api',
  
  // Cache configuration
  cacheTtl: parseInt(process.env.CACHE_TTL) || 600, // 10 minutes default
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
};

module.exports = config;