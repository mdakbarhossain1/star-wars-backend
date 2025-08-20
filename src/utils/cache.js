// src/utils/cache.js
const NodeCache = require("node-cache");

// Create a single cache instance with 10 minutes TTL
const cache = new NodeCache({
  stdTTL: 600, // 10 minutes
  checkperiod: 120, // auto-check expired keys every 2 minutes
  useClones: false,
});

const get = (key) => {
  const value = cache.get(key);
  if (value === undefined) return null; // safer than returning undefined
  return value;
};

const set = (key, value, ttl) => {
  return cache.set(key, value, ttl);
};

const del = (keys) => {
  return cache.del(keys);
};

const flush = () => {
  return cache.flushAll();
};

const connectToCache = () => {
  console.log("Cache initialized ✅");
  return cache;
};

module.exports = {
  cache,
  get,
  set,
  del,
  flush,
  connectToCache,
};
