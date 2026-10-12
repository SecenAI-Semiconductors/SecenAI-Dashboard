/**
 * AI Assistant controller.
 *
 * POST /api/ai-assistant/chat
 *
 * Flow:
 *   1. Validate input (non-empty, max 500 chars)
 *   2. Rate-limit per user (IP-based, since no auth tokens exist yet)
 *   3. Build farmer context (minimal for now — ready for expansion)
 *   4. Trim history to last 6 messages
 *   5. Call Gemini via aiAssistantService
 *   6. Return { reply } on success
 *
 * On failure:
 *   - Return a farmer-friendly error message
 *   - Never expose keys, stack traces, or backend details
 *   - Log details server-side only
 */

const {
  generateChatReply,
  buildFarmerContext,
} = require("../services/aiAssistantService");

// ── Simple in-memory per-user rate limiting ──
// Keyed by IP address. Tracks timestamps of recent requests.
const MAX_REQUESTS_PER_WINDOW = 20;
const WINDOW_MS = 60 * 1000; // 1 minute
const rateLimitMap = new Map();

function isRateLimited(userKey) {
  const now = Date.now();
  let timestamps = rateLimitMap.get(userKey);

  if (!timestamps) {
    timestamps = [];
    rateLimitMap.set(userKey, timestamps);
  }

  // Remove expired entries
  const validTimestamps = timestamps.filter((ts) => now - ts < WINDOW_MS);
  rateLimitMap.set(userKey, validTimestamps);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  validTimestamps.push(now);
  return false;
}

// Periodically clean up stale entries (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of rateLimitMap.entries()) {
    const valid = timestamps.filter((ts) => now - ts < WINDOW_MS);
    if (valid.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, valid);
    }
  }
}, 5 * 60 * 1000);

/**
 * Identify the user from the request.
 * Uses IP address as a proxy for user identity since the project
 * does not have JWT/session-based authentication yet.
 * When auth is added, this should use req.user or session data.
 */
function identifyUser(req) {
  return req.ip || req.headers["x-forwarded-for"] || "unknown";
}

/**
 * POST /api/ai-assistant/chat
 */
async function postChat(req, res) {
  try {
    const userKey = identifyUser(req);

    // ── Step 1: Rate limiting ──
    if (isRateLimited(userKey)) {
      console.warn(`[AIAssistant] Rate limited: ${userKey}`);
      return res.status(429).json({
        reply: "I'm having trouble connecting right now. Please try again in a moment.",
      });
    }

    // ── Step 2: Validate input ──
    const { message, history } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        reply: "I'm having trouble connecting right now. Please try again in a moment.",
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 500) {
      return res.status(400).json({
        reply: "I'm having trouble connecting right now. Please try again in a moment.",
      });
    }

    // Validate history format
    let validHistory = [];
    if (Array.isArray(history)) {
      validHistory = history
        .filter(
          (entry) =>
            entry &&
            typeof entry.content === "string" &&
            (entry.role === "user" || entry.role === "assistant")
        )
        .slice(-6); // Keep only the last 6 messages
    }

    // ── Step 3: Build farmer context ──
    // For now, pass empty context. When farmer profile lookup is
    // wired up, we can fetch from DB using the authenticated user.
    const context = buildFarmerContext({
      farmer: null,
      crop: null,
      weather: null,
      soil: null,
    });

    // ── Step 4: Call Gemini ──
    console.log(`[AIAssistant] Chat request from ${userKey}, message length: ${trimmedMessage.length}`);
    const reply = await generateChatReply({
      message: trimmedMessage,
      history: validHistory,
      context,
    });

    return res.json({ reply });
  } catch (err) {
    // Catch-all: never crash, never expose internals
    console.error("[AIAssistant] Chat endpoint error:", err.message);
    console.error("[AIAssistant] Stack:", err.stack);
    return res.status(500).json({
      reply: "I'm having trouble connecting right now. Please try again in a moment.",
    });
  }
}

module.exports = { postChat };
