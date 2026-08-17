/**
 * In-memory cache for Gemini weather intelligence responses.
 *
 * ⚠️  SERVERLESS CAVEAT (Vercel):
 * This is an in-memory Map — it only helps within a single warm function
 * instance. Vercel serverless functions are ephemeral: each request may hit a
 * different instance, and cold starts wipe the cache entirely. This means:
 *   - Cache hit rate depends on how often a single instance is reused.
 *   - There is NO cross-instance or cross-region sharing.
 *   - This is a known-limited stopgap. For reliable caching at scale,
 *     use Vercel KV or Upstash Redis.
 *
 * Cache key format: `${lat}_${lon}_${hourBucket}`
 * TTL: 1 hour (3600s). Regenerate roughly hourly, not on every page refresh.
 */

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

/** @type {Map<string, { data: any, timestamp: number }>} */
const cache = new Map();

/**
 * Build a cache key from coordinates and the current hourly time bucket.
 * Shareable across users with the same location in the same hour.
 */
function buildCacheKey(lat, lon) {
  const hourBucket = Math.floor(Date.now() / DEFAULT_TTL_MS);
  // Round coords to ~1km precision to avoid near-miss cache misses
  const latRound = Math.round(lat * 100) / 100;
  const lonRound = Math.round(lon * 100) / 100;
  return `${latRound}_${lonRound}_${hourBucket}`;
}

/**
 * Get a cached value. Returns null if missing or expired.
 */
function get(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > DEFAULT_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Store a value in cache.
 */
function set(key, data) {
  // Prevent unbounded growth in long-lived instances
  if (cache.size > 500) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }

  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Check if a cache entry exists and is still fresh.
 */
function has(key) {
  return get(key) !== null;
}

module.exports = {
  buildCacheKey,
  get,
  set,
  has,
};
