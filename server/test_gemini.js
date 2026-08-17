/**
 * Diagnostic test: calls Gemini directly and logs the result or error.
 * Run: node test_gemini.js
 */
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const util = require("util");

function logGeminiError(err, label) {
  console.error(`[${label}] error:`);
  console.error(err?.message || err);
  console.error(`[${label}] full error dump:`);
  console.error(util.inspect(err, { depth: 10, colors: false, showHidden: true }));

  const response = err?.response;
  if (!response) return;

  console.error(`[${label}] response metadata:`);
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

async function main() {
  console.log("GEMINI_API_KEY set:", Boolean(process.env.GEMINI_API_KEY));
  console.log("GEMINI_MODEL:", process.env.GEMINI_MODEL || "gemini-3.5-flash-lite");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("ERROR: No GEMINI_API_KEY in env");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

  console.log("\n--- Test 1: Simple generateContent (no schema) ---");
  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Say hello in one sentence.",
    });
    console.log("SUCCESS:", response.text);
  } catch (err) {
    console.error("FAILED:", err.message);
    console.error("Error type:", err.constructor?.name);
    if (err.status) console.error("HTTP status:", err.status);
    if (err.statusText) console.error("Status text:", err.statusText);
    if (err.errorDetails) console.error("Details:", JSON.stringify(err.errorDetails));
    logGeminiError(err, "Test 1");
  }

  console.log("\n--- Test 2: With responseSchema ---");
  try {
    const response = await ai.models.generateContent({
      model,
      contents: "What is the weather like for farming today if it is 33C, 65% humidity, and 12 km/h wind?",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            summary: { type: "STRING" },
            recommendation: { type: "STRING" },
          },
          required: ["summary", "recommendation"],
        },
        thinkingConfig: {
          thinkingLevel: "medium",
        },
      },
    });
    console.log("SUCCESS:", response.text);
  } catch (err) {
    console.error("FAILED:", err.message);
    console.error("Error type:", err.constructor?.name);
    if (err.status) console.error("HTTP status:", err.status);
    if (err.statusText) console.error("Status text:", err.statusText);
    if (err.errorDetails) console.error("Details:", JSON.stringify(err.errorDetails));
    logGeminiError(err, "Test 2");
  }

  console.log("\n--- Test 3: With systemInstruction as string ---");
  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Say OK.",
      systemInstruction: "You are a helpful assistant. Reply in one word only.",
    });
    console.log("SUCCESS:", response.text);
  } catch (err) {
    console.error("FAILED:", err.message);
    console.error("Error type:", err.constructor?.name);
    if (err.status) console.error("HTTP status:", err.status);
    if (err.errorDetails) console.error("Details:", JSON.stringify(err.errorDetails));
    logGeminiError(err, "Test 3");
  }

  console.log("\n--- Test 4: With AbortController / requestOptions ---");
  try {
    const controller = new AbortController();
    const response = await ai.models.generateContent({
      model,
      contents: "Say hello.",
      requestOptions: {
        signal: controller.signal,
      },
    });
    console.log("SUCCESS:", response.text);
  } catch (err) {
    console.error("FAILED:", err.message);
    console.error("Error type:", err.constructor?.name);
    if (err.status) console.error("HTTP status:", err.status);
    if (err.errorDetails) console.error("Details:", JSON.stringify(err.errorDetails));
    logGeminiError(err, "Test 4");
  }
}

main().catch(console.error);
