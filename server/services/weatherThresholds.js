/**
 * Centralized weather risk thresholds.
 * These mirror the client-side thresholds in weatherApi.js and are the
 * single source of truth for deterministic risk level calculations.
 * Gemini never overrides these values.
 */

// ── Rain risk thresholds (rain probability %) ──
const RAIN_HIGH = 70;
const RAIN_MODERATE = 40;
const RAIN_LOW = 20;

// ── Wind risk thresholds (km/h) ──
const WIND_HIGH = 18;
const WIND_MODERATE = 12;

// ── Heat risk thresholds (°C) ──
const HEAT_HIGH = 38;
const HEAT_MODERATE = 32;

// ── Cold risk thresholds (°C) ──
const COLD_HIGH = 8;
const COLD_MODERATE = 15;

// ── UV risk thresholds (UVI) ──
const UV_SEVERE = 8;
const UV_HIGH = 6;
const UV_MODERATE = 3;

/**
 * Map a risk string to the Low | Moderate | High enum.
 * "Severe" from UV is mapped to "High" to stay within the required enum.
 */
function normalizeRiskLevel(level) {
  if (level === "Severe") return "High";
  if (level === "High" || level === "Moderate" || level === "Low") return level;
  return "Unknown";
}

function getUvRiskRaw(uvi) {
  if (uvi == null) return "Unknown";
  if (uvi >= UV_SEVERE) return "Severe";
  if (uvi >= UV_HIGH) return "High";
  if (uvi >= UV_MODERATE) return "Moderate";
  return "Low";
}

/**
 * Compute deterministic risk levels from weather data.
 * Returns an object matching the weatherRisks schema with level values only
 * (explanations come from Gemini).
 */
function computeRiskLevels(current, summary) {
  const rainChance = summary.dayRainChance ?? summary.rainProbability ?? 0;
  const wind = current.windSpeed ?? 0;
  const temp = current.temp ?? 0;
  const uvi = current.uvi ?? 0;

  // Heavy rain risk
  const rainRiskRaw =
    rainChance >= RAIN_HIGH
      ? "Severe"
      : rainChance >= RAIN_MODERATE
        ? "High"
        : rainChance >= RAIN_LOW
          ? "Moderate"
          : "Low";

  // Flood risk (derived from rain risk)
  const floodRiskRaw =
    rainRiskRaw === "Severe"
      ? "High"
      : rainRiskRaw === "High"
        ? "Moderate"
        : "Low";

  // Wind risk
  const windRiskRaw =
    wind >= WIND_HIGH ? "High" : wind >= WIND_MODERATE ? "Moderate" : "Low";

  // Heatwave risk
  const heatRiskRaw =
    temp >= HEAT_HIGH ? "High" : temp >= HEAT_MODERATE ? "Moderate" : "Low";

  // Cold stress
  const coldRiskRaw =
    temp <= COLD_HIGH ? "High" : temp <= COLD_MODERATE ? "Moderate" : "Low";

  // UV exposure
  const uvRiskRaw = getUvRiskRaw(uvi);

  return {
    heavyRainRisk: { level: normalizeRiskLevel(rainRiskRaw) },
    floodRisk: { level: normalizeRiskLevel(floodRiskRaw) },
    strongWindRisk: { level: normalizeRiskLevel(windRiskRaw) },
    heatwaveRisk: { level: normalizeRiskLevel(heatRiskRaw) },
    coldStress: { level: normalizeRiskLevel(coldRiskRaw) },
    uvExposure: { level: normalizeRiskLevel(uvRiskRaw) },
  };
}

module.exports = {
  computeRiskLevels,
  normalizeRiskLevel,
  // Export thresholds for testing
  RAIN_HIGH,
  RAIN_MODERATE,
  RAIN_LOW,
  WIND_HIGH,
  WIND_MODERATE,
  HEAT_HIGH,
  HEAT_MODERATE,
  COLD_HIGH,
  COLD_MODERATE,
  UV_SEVERE,
  UV_HIGH,
  UV_MODERATE,
};
