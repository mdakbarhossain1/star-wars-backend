// src/services/swapiService.js
// const axios = require('axios');
const axios = require("axios");
const cache = require('../utils/cache');

const SWAPI_BASE_URL = 'https://www.swapi.tech/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: SWAPI_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API response error:', error.message);
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    }
    return Promise.reject(error);
  }
);

class SwapiService {
  constructor() {
    this.cacheEnabled = true;
  }

  // Generic request method with caching
  async request(url, cacheKey, ttl = 600) {
    if (this.cacheEnabled) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for: ${cacheKey}`);
        return cachedData;
      }
    }

    try {
      const response = await apiClient.get(url);
      const data = response.data;
      
      if (this.cacheEnabled) {
        cache.set(cacheKey, data, ttl);
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching from SWAPI: ${error.message}`);
      throw new Error(`SWAPI request failed: ${error.message}`);
    }
  }

  // Get all characters with pagination
  async getCharacters(page = 1, limit = 10) {
    const cacheKey = `characters_page_${page}_limit_${limit}`;
    const url = `/people?page=${page}&limit=${limit}`;
    
    return this.request(url, cacheKey);
  }

  // Search characters by name
  async searchCharacters(name, page = 1, limit = 10) {
    const cacheKey = `search_${name}_page_${page}_limit_${limit}`;
    const url = `/people?name=${encodeURIComponent(name)}&page=${page}&limit=${limit}`;
    
    return this.request(url, cacheKey);
  }

  // Get character by ID
  async getCharacterById(id) {
    const cacheKey = `character_${id}`;
    const url = `/people/${id}`;
    
    return this.request(url, cacheKey);
  }

  // Get additional details (films, planets, etc.)
  async getResource(url) {
    const cacheKey = `resource_${url.split('/').pop()}`;
    return this.request(url, cacheKey, 3600); // Longer TTL for static resources
  }

  // Batch get resources
  async getResources(urls) {
    return Promise.all(urls.map(url => this.getResource(url)));
  }

  // Disable cache for testing or specific scenarios
  disableCache() {
    this.cacheEnabled = false;
  }

  // Enable cache
  enableCache() {
    this.cacheEnabled = true;
  }
}

module.exports = new SwapiService();