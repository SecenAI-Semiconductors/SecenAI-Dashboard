/**
 * Gemini AI service for weather intelligence.
 * Uses the official @google/genai SDK with structured JSON output.
 *
 * Model is set via GEMINI_MODEL env var (centralized constant, never hardcoded
 * in multiple files). Defaults to "gemini-3.5-flash-lite".
 *
 * All calls are server-side only. The API key never reaches the frontend.
 */

const { GoogleGenAI } = require("@google/genai");
const util = require("util");

// ── Centralized model constant ──
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// ── Request timeout (ms) ──
const REQUEST_TIMEOUT_MS = 10000;

// ── Safety system instruction ──
const SYSTEM_INSTRUCTION = `You are an agricultural weather intelligence analyst. Your role is to interpret weather data for farming decisions.

CRITICAL RULES:
1. Treat ALL supplied weather values (temperatures, humidity, wind speeds, rainfall, probabilities, UV index) as authoritative. NEVER override, invent, estimate, or fabricate any measurements, rainfall amounts, temperatures, percentages, or confidence scores.
2. NEVER invent crop-specific data. If no crop type or growth stage is provided, give general agricultural guidance applicable to common crops — do not fabricate crop-specific advice.
3. NEVER give specific pesticide chemical names or dosages. Only provide general suitability and timing guidance for pesticide application.
4. When data is insufficient to make a determination, set the status/level to "Unknown" and explain what data is missing. Do NOT guess.
5. Explain WHY a condition matters for agriculture, not just restate the number. For example, don't say "Temperature is 38°C" — say "At 38°C, heat stress can cause pollen sterility in many grain crops, reducing yield potential."
6. Return ONLY the required JSON structure, nothing else. No markdown, no explanations outside the JSON.`;

/**
 * Response schema for structured JSON output.
 * Uses Google GenAI schema types (STRING, OBJECT, ARRAY, ENUM).
 */
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    weatherAnalysis: {
      type: "OBJECT",
      properties: {
        summary: { type: "STRING" },
        highestTemperature: { type: "STRING" },
        lowestTemperature: { type: "STRING" },
        averageHumidity: { type: "STRING" },
        highestWindSpeed: { type: "STRING" },
        expectedRainfall: { type: "STRING" },
        uvRiskLevel: { type: "STRING" },
      },
      required: [
        "summary",
        "highestTemperature",
        "lowestTemperature",
        "averageHumidity",
        "highestWindSpeed",
        "expectedRainfall",
        "uvRiskLevel",
      ],
    },
    agriculturalAnalysis: {
      type: "OBJECT",
      properties: {
        cropGrowthConditions: {
          type: "OBJECT",
          properties: {
            status: {
              type: "STRING",
              enum: ["Favorable", "Moderate", "Unfavorable", "Unknown"],
            },
            explanation: { type: "STRING" },
          },
          required: ["status", "explanation"],
        },
        heatStress: {
          type: "OBJECT",
          properties: {
            status: {
              type: "STRING",
              enum: ["Favorable", "Moderate", "Unfavorable", "Unknown"],
            },
            explanation: { type: "STRING" },
          },
          required: ["status", "explanation"],
        },
        rainfallSuitability: {
          type: "OBJECT",
          properties: {
            status: {
              type: "STRING",
              enum: ["Favorable", "Moderate", "Unfavorable", "Unknown"],
            },
            explanation: { type: "STRING" },
          },
          required: ["status", "explanation"],
        },
        windImpact: {
          type: "OBJECT",
          properties: {
            status: {
              type: "STRING",
              enum: ["Favorable", "Moderate", "Unfavorable", "Unknown"],
            },
            explanation: { type: "STRING" },
          },
          required: ["status", "explanation"],
        },
        irrigationNeed: {
          type: "OBJECT",
          properties: {
            status: {
              type: "STRING",
              enum: ["Favorable", "Moderate", "Unfavorable", "Unknown"],
            },
            explanation: { type: "STRING" },
          },
          required: ["status", "explanation"],
        },
        soilMoistureExpectation: {
          type: "OBJECT",
          properties: {
            status: {
              type: "STRING",
              enum: ["Favorable", "Moderate", "Unfavorable", "Unknown"],
            },
            explanation: { type: "STRING" },
          },
          required: ["status", "explanation"],
        },
      },
      required: [
        "cropGrowthConditions",
        "heatStress",
        "rainfallSuitability",
        "windImpact",
        "irrigationNeed",
        "soilMoistureExpectation",
      ],
    },
    weatherRisks: {
      type: "OBJECT",
      properties: {
        heavyRainRisk: {
          type: "OBJECT",
          properties: {
            level: {
              type: "STRING",
              enum: ["Low", "Moderate", "High", "Unknown"],
            },
            explanation: { type: "STRING" },
          },
          required: ["level", "explanation"],
        },
        floodRisk: {
          type: "OBJECT",
          properties: {
            level: {
              type: "STRING",
              enum: ["Low", "Moderate", "High", "Unknown"],
            },
            explanation: { type: "STRING" },
          },
          required: ["level", "explanation"],
        },
        strongWindRisk: {
          type: "OBJECT",
          properties: {
            level: {
              type: "STRING",
              enum: ["Low", "Moderate", "High", "Unknown"],
            },
            explanation: { type: "STRING" },
          },
          required: ["level", "explanation"],
        },
        heatwaveRisk: {
          type: "OBJECT",
          properties: {
            level: {
              type: "STRING",
              enum: ["Low", "Moderate", "High", "Unknown"],
            },
            explanation: { type: "STRING" },
          },
          required: ["level", "explanation"],
        },
        coldStress: {
          type: "OBJECT",
          properties: {
            level: {
              type: "STRING",
              enum: ["Low", "Moderate", "High", "Unknown"],
            },
            explanation: { type: "STRING" },
          },
          required: ["level", "explanation"],
        },
        uvExposure: {
          type: "OBJECT",
          properties: {
            level: {
              type: "STRING",
              enum: ["Low", "Moderate", "High", "Unknown"],
            },
            explanation: { type: "STRING" },
          },
          required: ["level", "explanation"],
        },
      },
      required: [
        "heavyRainRisk",
        "floodRisk",
        "strongWindRisk",
        "heatwaveRisk",
        "coldStress",
        "uvExposure",
      ],
    },
    aiRecommendation: {
      type: "OBJECT",
      properties: {
        headline: { type: "STRING" },
        priority: { type: "STRING", enum: ["Low", "Medium", "High"] },
        summary: { type: "STRING" },
        recommendations: { type: "ARRAY", items: { type: "STRING" } },
        warnings: { type: "ARRAY", items: { type: "STRING" } },
      },
      required: [
        "headline",
        "priority",
        "summary",
        "recommendations",
        "warnings",
      ],
    },
    farmingRecommendations: {
      type: "OBJECT",
      properties: {
        irrigation: { type: "STRING" },
        fertilizer: { type: "STRING" },
        pesticideSpraying: { type: "STRING" },
        harvesting: { type: "STRING" },
        fieldWork: { type: "STRING" },
      },
      required: [
        "irrigation",
        "fertilizer",
        "pesticideSpraying",
        "harvesting",
        "fieldWork",
      ],
    },
  },
  required: [
    "weatherAnalysis",
    "agriculturalAnalysis",
    "weatherRisks",
    "aiRecommendation",
    "farmingRecommendations",
  ],
};

function logGeminiError(err, context) {
  console.error(`[Gemini] ${context} error:`);
  console.error(err?.message || err);
  console.error(`[Gemini] ${context} full dump:`);
  console.error(util.inspect(err, { depth: 10, colors: false, showHidden: true }));

  const response = err?.response;
  if (!response) return;

  console.error(`[Gemini] ${context} response metadata:`);
  console.error(
    util.inspect(
      {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        type: response.type,
        redirected: response.redirected,
        headers: response.headers
          ? Object.fromEntries(response.headers.entries())
          : undefined,
      },
      { depth: 10, colors: false, showHidden: true }
    )
  );
}

/**
 * Build the user prompt from normalized weather data.
 */
function buildPrompt(weatherData) {
  const { current, summary, hourly, daily, locationName } = weatherData;

  const hourlySnippet = (hourly || [])
    .slice(0, 6)
    .map(
      (h) =>
        `  ${h.time}: ${h.temp}°C, ${h.humidity}% humidity, ${h.windSpeed} km/h wind, ${h.pop}% rain chance`
    )
    .join("\n");

  const dailySnippet = (daily || [])
    .map(
      (d) =>
        `  ${d.day}: ${d.minTemp}–${d.maxTemp}°C, ${d.humidity}% humidity, ${d.windSpeed} km/h wind, ${d.pop}% rain`
    )
    .join("\n");

  return `Analyze the following weather data for agricultural purposes at ${locationName || "the given location"}.

CURRENT CONDITIONS:
- Temperature: ${current.temp}°C (feels like ${current.feelsLike}°C)
- Humidity: ${current.humidity}%
- Wind Speed: ${current.windSpeed} km/h
- Visibility: ${current.visibility} km
- UV Index: ${current.uvi}
- Pressure: ${current.pressure} hPa
- Description: ${current.description}

WEATHER SUMMARY:
- Highest Temperature: ${summary.highestTemperature}°C
- Lowest Temperature: ${summary.lowestTemperature}°C
- Average Humidity: ${summary.avgHumidity}%
- Highest Wind Speed: ${summary.highestWindSpeed} km/h
- Expected Rainfall: ${summary.expectedRainfall} mm
- UV Risk: ${summary.uvRisk}
- Rain Probability: ${summary.rainProbability}%

HOURLY FORECAST (next 18 hours):
${hourlySnippet || "  No hourly data available"}

MULTI-DAY FORECAST:
${dailySnippet || "  No daily data available"}

No specific crop type or growth stage is provided. Give general agricultural guidance applicable to common crops in this region. Structure the input so crop-specific advice can be added later if crop data becomes available.

Provide your analysis as the required JSON structure.`;
}

/**
 * Call Gemini to generate weather intelligence.
 * Returns parsed JSON on success, throws on failure/timeout.
 */
async function generateWeatherIntelligence(weatherData) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Set up abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildPrompt(weatherData),
      systemInstruction: SYSTEM_INSTRUCTION,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        thinkingConfig: {
          thinkingLevel: "medium",
        },
      },
      requestOptions: {
        signal: controller.signal,
      },
    });

    clearTimeout(timeoutId);

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    // Parse the JSON response
    const parsed = JSON.parse(text);
    return parsed;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === "AbortError") {
      throw new Error("Gemini request timed out");
    }

    logGeminiError(err, "generateWeatherIntelligence");

    throw err;
  }
}

module.exports = {
  generateWeatherIntelligence,
  GEMINI_MODEL,
  REQUEST_TIMEOUT_MS,
};
