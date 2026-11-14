/**
 * marketProxyRoutes.js
 *
 * Server-side proxy for data.gov.in AGMARKNET commodity prices.
 * Avoids browser CORS issues by fetching from Node (no Origin header).
 * Includes in-memory cache (5-min TTL) to stay within the free API key
 * rate limit (data.gov.in sample key: ~10 req/min).
 *
 * GET /api/market/prices
 *   Query params (all optional):
 *     commodity, state, district, market, limit, offset
 *
 * No JWT required — public commodity price data.
 */

const express = require("express");
const https   = require("https");
const router  = express.Router();

const RESOURCE_ID    = "9ef84268-d588-465a-a308-a864a43d0070";
const DATA_GOV_HOST  = "api.data.gov.in";
const CACHE_TTL_MS   = 5 * 60 * 1000;   // 5 minutes

// ── Simple in-memory cache ────────────────────────────────────────────────────
const _cache = new Map();   // key → { data, expiresAt }

function cacheGet(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { _cache.delete(key); return null; }
  return entry.data;
}

function cacheSet(key, data) {
  _cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ── Upstream fetch ────────────────────────────────────────────────────────────
function fetchFromDataGov(params) {
  return new Promise((resolve, reject) => {
    const qs   = new URLSearchParams(params).toString();
    const path = `/resource/${RESOURCE_ID}?${qs}`;

    const req = https.request(
      { hostname: DATA_GOV_HOST, path, method: "GET",
        headers: { Accept: "application/json", "User-Agent": "SecenAI-Server/1.0" },
        timeout: 15000 },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
          catch { reject(new Error("Invalid JSON from data.gov.in")); }
        });
      }
    );

    req.on("timeout", () => { req.destroy(); reject(new Error("data.gov.in request timed out")); });
    req.on("error", reject);
    req.end();
  });
}

// ── GET /api/market/prices ────────────────────────────────────────────────────
router.get("/prices", async (req, res) => {
  const apiKey = process.env.AGMARKNET_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: "AGMARKNET_API_KEY not configured on server." });
  }

  const {
    commodity = "",
    state     = "",
    district  = "",
    market    = "",
    limit     = "500",
    offset    = "0",
  } = req.query;

  const params = {
    "api-key": apiKey,
    format:    "json",
    limit:     String(Math.min(Number(limit) || 500, 1000)),
    offset:    String(Number(offset) || 0),
  };
  if (state.trim())     params["filters[state.keyword]"] = state.trim();
  if (district.trim())  params["filters[district]"]      = district.trim();
  if (market.trim())    params["filters[market]"]         = market.trim();
  if (commodity.trim()) params["filters[commodity]"]      = commodity.trim();

  // Cache key = all query params (sorted for stability)
  const cacheKey = JSON.stringify(
    Object.entries(params).filter(([k]) => k !== "api-key").sort()
  );

  // Return cached response if fresh
  const cached = cacheGet(cacheKey);
  if (cached) {
    res.set("X-Cache", "HIT");
    return res.json(cached);
  }

  try {
    const { status, data } = await fetchFromDataGov(params);

    if (status === 429) {
      // If rate-limited and we have a stale cache entry, serve it rather than error
      const stale = _cache.get(cacheKey);
      if (stale) {
        res.set("X-Cache", "STALE");
        return res.json(stale.data);
      }
      return res.status(429).json({
        message: "Market data rate limit reached. Please wait a minute and try again.",
      });
    }

    if (status !== 200) {
      return res.status(status).json({ message: "data.gov.in returned an error", upstream: data });
    }

    cacheSet(cacheKey, data);
    res.set("X-Cache", "MISS");
    return res.json(data);
  } catch (err) {
    console.error("[market-proxy]", err.message);
    return res.status(502).json({ message: err.message });
  }
});

module.exports = router;
