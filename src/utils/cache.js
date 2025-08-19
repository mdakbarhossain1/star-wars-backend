// src/utils/cache.js
const NodeCache = require('node-cache');

class CacheService {
  constructor(ttlSeconds) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false
    });
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    return this.cache.set(key, value);
  }

  del(keys) {
    return this.cache.del(keys);
  }

  flush() {
    return this.cache.flushAll();
  }
}

// Create a cache instance with 10 minutes TTL
const cache = new CacheService(600);

module.exports = {
  cache,
  connectToCache: () => {
    console.log('Cache initialized');
    return cache;
  }
};