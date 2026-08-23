/**
 * Weather Intelligence controller.
 *
 * POST /api/weather/intelligence
 *
 * Flow:
 *   1. Receive normalized weather data from frontend
 *   2. Compute deterministic risk levels (server-side thresholds)
 *   3. Check in-memory cache
 *   4. On cache miss: call Gemini (blocking, up to 10s timeout)
 *   5. Validate Gemini response
 *   6. Cache valid response
 *   7. Return combined result
 *
 * On Gemini failure/timeout/invalid response:
 *   - Return deterministic data + aiUnavailable flag
 *   - Never crash the dashboard
 *   - Never expose API errors, keys, or stack traces to the frontend
 */

const { generateWeatherIntelligence } = require("../services/geminiService");
const { computeRiskLevels } = require("../services/weatherThresholds");
const { validateGeminiResponse } = require("../services/weatherValidator");
const weatherCache = require("../services/weatherCache");

/**
 * Validate incoming request body has the minimum required fields.
 */
function validateRequestBody(body) {
  if (!body || typeof body !== "object") return false;

  const { current, summary } = body;
  if (!current || typeof current !== "object") return false;
  if (!summary || typeof summary !== "object") return false;
  if (typeof current.temp !== "number") return false;
  if (typeof current.humidity !== "number") return false;

  return true;
}

async function postWeatherIntelligence(req, res) {
  try {
    const body = req.body;

    console.log("[WeatherIntel] Request received. GEMINI_API_KEY set:", Boolean(process.env.GEMINI_API_KEY));

    // ── Step 1: Validate input ──
    if (!validateRequestBody(body)) {
      console.error("[WeatherIntel] Request body validation failed");
      return res.status(400).json({
        message: "Invalid request. Required: current (with temp, humidity), summary.",
      });
    }

    const { current, summary, hourly, daily, locationName, coords } = body;

    // ── Step 2: Compute deterministic risk levels ──
    const deterministicRisks = computeRiskLevels(current, summary);

    // ── Step 3: Check cache ──
    const lat = coords?.lat ?? 0;
    const lon = coords?.lon ?? 0;
    const cacheKey = weatherCache.buildCacheKey(lat, lon);
    const cached = weatherCache.get(cacheKey);

    if (cached) {
      // Overlay deterministic risk levels onto cached AI data
      // (risk levels always come from thresholds, never from cache/Gemini)
      const mergedRisks = mergeRisksWithDeterministic(
        cached.weatherRisks,
        deterministicRisks
      );

      return res.json({
        ...cached,
        weatherRisks: mergedRisks,
        aiUnavailable: false,
        cached: true,
      });
    }

    // ── Step 4: Call Gemini (blocking, with timeout) ──
    console.log("[WeatherIntel] Cache miss — calling Gemini...");
    let geminiData;
    try {
      geminiData = await generateWeatherIntelligence({
        current,
        summary,
        hourly: hourly || [],
        daily: daily || [],
        locationName: locationName || "Unknown",
      });
      console.log("[WeatherIntel] Gemini responded. Keys:", geminiData ? Object.keys(geminiData) : "null");
    } catch (geminiError) {
      // Gemini failed/timed out — return deterministic fallback
      console.error(
        "[WeatherIntel] Gemini FAILED:",
        geminiError.message
      );
      console.error("[WeatherIntel] Error type:", geminiError.constructor?.name);
      if (geminiError.status) console.error("[WeatherIntel] HTTP status:", geminiError.status);
      if (geminiError.statusText) console.error("[WeatherIntel] Status text:", geminiError.statusText);
      return res.json({
        weatherRisks: addEmptyExplanations(deterministicRisks),
        aiUnavailable: true,
        cached: false,
      });
    }

    // ── Step 5: Validate Gemini response ──
    const validation = validateGeminiResponse(geminiData);

    if (!validation.valid) {
      console.error("[WeatherIntel] Validation FAILED:", validation.error);
      console.error("[WeatherIntel] Raw Gemini keys:", geminiData ? Object.keys(geminiData) : "null");
      // Log a sample of the raw data to diagnose schema mismatches
      try {
        console.error("[WeatherIntel] Raw sample:", JSON.stringify(geminiData).slice(0, 500));
      } catch (_) {}
      return res.json({
        weatherRisks: addEmptyExplanations(deterministicRisks),
        aiUnavailable: true,
        cached: false,
      });
    }
    console.log("[WeatherIntel] Validation passed. Caching and returning.");

    // ── Step 6: Override Gemini risk levels with deterministic ones ──
    const mergedRisks = mergeRisksWithDeterministic(
      validation.data.weatherRisks,
      deterministicRisks
    );

    const result = {
      ...validation.data,
      weatherRisks: mergedRisks,
    };

    // ── Step 7: Cache the result ──
    weatherCache.set(cacheKey, result);

    return res.json({
      ...result,
      aiUnavailable: false,
      cached: false,
    });
  } catch (err) {
    // Catch-all: never crash, never expose internals
    console.error("Weather intelligence endpoint error:", err.message);
    return res.status(500).json({
      message: "AI analysis is temporarily unavailable.",
      aiUnavailable: true,
    });
  }
}

/**
 * Merge Gemini-provided risk explanations with deterministic risk levels.
 * Deterministic levels are always the source of truth.
 */
function mergeRisksWithDeterministic(geminiRisks, deterministicRisks) {
  const riskKeys = [
    "heavyRainRisk",
    "floodRisk",
    "strongWindRisk",
    "heatwaveRisk",
    "coldStress",
    "uvExposure",
  ];

  const merged = {};
  for (const key of riskKeys) {
    merged[key] = {
      level: deterministicRisks[key]?.level || "Unknown",
      explanation: geminiRisks?.[key]?.explanation || "",
    };
  }

  return merged;
}

/**
 * Create risk objects with deterministic levels and empty explanations.
 * Used when Gemini is unavailable.
 */
function addEmptyExplanations(deterministicRisks) {
  const result = {};
  for (const [key, value] of Object.entries(deterministicRisks)) {
    result[key] = {
      level: value.level,
      explanation: "",
    };
  }
  return result;
}

module.exports = { postWeatherIntelligence };
