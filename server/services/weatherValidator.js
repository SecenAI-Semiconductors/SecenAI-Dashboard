/**
 * Validates Gemini responses against the expected weather intelligence schema.
 * Manual validation — no Zod dependency (project doesn't use it).
 *
 * Validates: required fields, enum values, array types.
 * Rejects malformed output and returns a safe fallback signal.
 */

const AGRICULTURAL_STATUSES = new Set([
  "Favorable",
  "Moderate",
  "Unfavorable",
  "Unknown",
]);
const RISK_LEVELS = new Set(["Low", "Moderate", "High", "Unknown"]);
const PRIORITIES = new Set(["Low", "Medium", "High"]);

/**
 * Validate a single { status, explanation } object.
 */
function isValidStatusExplanation(obj) {
  if (!obj || typeof obj !== "object") return false;
  if (typeof obj.status !== "string" || typeof obj.explanation !== "string")
    return false;
  if (!AGRICULTURAL_STATUSES.has(obj.status)) return false;
  return true;
}

/**
 * Validate a single { level, explanation } object.
 */
function isValidLevelExplanation(obj) {
  if (!obj || typeof obj !== "object") return false;
  if (typeof obj.level !== "string" || typeof obj.explanation !== "string")
    return false;
  if (!RISK_LEVELS.has(obj.level)) return false;
  return true;
}

/**
 * Validate the full Gemini weather intelligence response.
 * Returns { valid: true, data } on success, { valid: false, error } on failure.
 */
function validateGeminiResponse(data) {
  try {
    if (!data || typeof data !== "object") {
      return { valid: false, error: "Response is not an object" };
    }

    // ── weatherAnalysis ──
    const wa = data.weatherAnalysis;
    if (!wa || typeof wa !== "object") {
      return { valid: false, error: "Missing weatherAnalysis" };
    }
    const waFields = [
      "summary",
      "highestTemperature",
      "lowestTemperature",
      "averageHumidity",
      "highestWindSpeed",
      "expectedRainfall",
      "uvRiskLevel",
    ];
    for (const field of waFields) {
      if (typeof wa[field] !== "string") {
        return {
          valid: false,
          error: `weatherAnalysis.${field} must be a string`,
        };
      }
    }

    // ── agriculturalAnalysis ──
    const ag = data.agriculturalAnalysis;
    if (!ag || typeof ag !== "object") {
      return { valid: false, error: "Missing agriculturalAnalysis" };
    }
    const agFields = [
      "cropGrowthConditions",
      "heatStress",
      "rainfallSuitability",
      "windImpact",
      "irrigationNeed",
      "soilMoistureExpectation",
    ];
    for (const field of agFields) {
      if (!isValidStatusExplanation(ag[field])) {
        return {
          valid: false,
          error: `agriculturalAnalysis.${field} is invalid (must have status enum + explanation)`,
        };
      }
    }

    // ── weatherRisks ──
    const wr = data.weatherRisks;
    if (!wr || typeof wr !== "object") {
      return { valid: false, error: "Missing weatherRisks" };
    }
    const wrFields = [
      "heavyRainRisk",
      "floodRisk",
      "strongWindRisk",
      "heatwaveRisk",
      "coldStress",
      "uvExposure",
    ];
    for (const field of wrFields) {
      if (!isValidLevelExplanation(wr[field])) {
        return {
          valid: false,
          error: `weatherRisks.${field} is invalid (must have level enum + explanation)`,
        };
      }
    }

    // ── aiRecommendation ──
    const ai = data.aiRecommendation;
    if (!ai || typeof ai !== "object") {
      return { valid: false, error: "Missing aiRecommendation" };
    }
    if (typeof ai.headline !== "string" || typeof ai.summary !== "string") {
      return {
        valid: false,
        error: "aiRecommendation.headline and summary must be strings",
      };
    }
    if (typeof ai.priority !== "string" || !PRIORITIES.has(ai.priority)) {
      return {
        valid: false,
        error: `aiRecommendation.priority must be one of: ${[...PRIORITIES].join(", ")}`,
      };
    }
    if (!Array.isArray(ai.recommendations)) {
      return {
        valid: false,
        error: "aiRecommendation.recommendations must be an array",
      };
    }
    if (!Array.isArray(ai.warnings)) {
      return {
        valid: false,
        error: "aiRecommendation.warnings must be an array",
      };
    }

    // ── farmingRecommendations ──
    const fr = data.farmingRecommendations;
    if (!fr || typeof fr !== "object") {
      return { valid: false, error: "Missing farmingRecommendations" };
    }
    const frFields = [
      "irrigation",
      "fertilizer",
      "pesticideSpraying",
      "harvesting",
      "fieldWork",
    ];
    for (const field of frFields) {
      if (typeof fr[field] !== "string") {
        return {
          valid: false,
          error: `farmingRecommendations.${field} must be a string`,
        };
      }
    }

    return { valid: true, data };
  } catch (err) {
    return { valid: false, error: `Validation threw: ${err.message}` };
  }
}

module.exports = { validateGeminiResponse };
