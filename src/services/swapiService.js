const axios = require("axios");
const { cache } = require("../utils/cache");

const SWAPI_BASE_URL = "https://www.swapi.tech/api";

// Axios instance
const apiClient = axios.create({
  baseURL: SWAPI_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Logging interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to: ${config.url}`
    );
    return config;
  },
  (error) => Promise.reject(error)
);

// Error logging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API response error:", error.message);
    if (error.response) console.error("Response data:", error.response.data);
    return Promise.reject(error);
  }
);

class SwapiService {
  constructor() {
    this.cacheEnabled = true;
  }

  // Generic request with caching
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

      if (this.cacheEnabled) cache.set(cacheKey, data);

      return data;
    } catch (error) {
      console.error(`Error fetching from SWAPI: ${error.message}`);
      throw new Error(`SWAPI request failed: ${error.message}`);
    }
  }

  // Get paginated list of characters
  async getCharacters(page = 1, limit = 10) {
    const cacheKey = `characters_page_${page}_limit_${limit}`;
    const url = `/people?page=${page}&limit=${limit}`;
    const data = await this.request(url, cacheKey);

    if (!data || !data.results) {
      return { results: [] };
    }

    return data;
  }

  async getAllCharacters() {
    const cacheKey = "all_characters";
    const data = await this.request("/people", cacheKey);
    return data.results || [];
  }

  // Search characters by name
  async searchCharacters(name) {
    const cacheKey = `search_${name}`;
    const url = `/people/?search=${encodeURIComponent(name)}`;
    const data = await this.request(url, cacheKey);

    if (!data || !data.result) return { results: [] };

    // swapi.tech returns `result` array directly
    return { results: data.result };
  }

  // Get character by ID
  async getCharacterById(id) {
    const cacheKey = `character_${id}`;
    const url = `/people/${id}`;
    return this.request(url, cacheKey);
  }

  // Get single resource by URL
  async getResource(url) {
    const cacheKey = `resource_${url.split("/").pop()}`;
    return this.request(url, cacheKey, 3600);
  }

  // Get multiple resources
  async getResources(urls) {
    return Promise.all(urls.map((url) => this.getResource(url)));
  }

  disableCache() {
    this.cacheEnabled = false;
  }

  enableCache() {
    this.cacheEnabled = true;
  }
}

module.exports = new SwapiService();
