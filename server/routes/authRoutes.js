/**
 * authRoutes.js
 *
 * Public auth endpoints (login, register) + protected auth utilities
 * (me, change-password).
 *
 * Rate limits:
 *   /register — 5 registrations per 15 min per IP
 *   /login    — 10 attempts per 15 min per IP
 */

const express     = require("express");
const rateLimit   = require("express-rate-limit");
const { ipKeyGenerator } = rateLimit;
const router      = express.Router();

const {
  register,
  login,
  getMe,
  changePassword,
} = require("../controllers/authController");

const authMiddleware        = require("../middleware/authMiddleware");
const { normalizePhone }    = require("../utils/phone");

// ── Rate limiters ─────────────────────────────────────────────────

// Register: strict — every attempt counts (5 per 15 min per IP).
const registerLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             5,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { message: "Too many registration attempts, please try again later." },
});

/**
 * Normalise an identifier the same way the login controller does so that
 * "9000000001", "+919000000001", and "09000000001" all share one bucket.
 *
 *  - email → toLowerCase().trim()
 *  - phone → normalizePhone() (strips +91 / 0 prefix, returns 10-digit canonical)
 *  - anything else → lowercase trim (safe fallback)
 */
function normalizeIdentifier(raw) {
  if (!raw || typeof raw !== "string") return "unknown-id";
  const trimmed = raw.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmed.toLowerCase())) {
    return trimmed.toLowerCase();
  }
  const phone = normalizePhone(trimmed);
  if (phone) return phone;
  return trimmed.toLowerCase();
}

// Login: only count FAILED attempts (skipSuccessfulRequests: true).
// Key = IP (via ipKeyGenerator for safe IPv6 handling) + normalised identifier
// so "+919000000001" and "9000000001" share one bucket, and account A's
// lockout does not burn quota for account B from the same IP.
// No validate override needed: trust proxy is set in server.js, so the
// xForwardedForHeader check never fires (it only throws when trust proxy === false).
const loginLimiter = rateLimit({
  windowMs:               15 * 60 * 1000, // 15 minutes
  max:                    10,             // 10 failures per window
  skipSuccessfulRequests: true,           // successful logins are NOT counted
  standardHeaders:        true,
  legacyHeaders:          false,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req.ip || req.socket.remoteAddress || "unknown-ip");
    const id = normalizeIdentifier(req.body && (req.body.identifier || req.body.phone || req.body.email));
    return `${ip}:${id}`;
  },
  message: { message: "Too many login attempts, please try again later." },
});

// ── Routes ────────────────────────────────────────────────────────

// POST /api/auth/register — farmer self-registration (rate limited)
router.post("/register", registerLimiter, register);

// POST /api/auth/login — email (admin) or phone (farmer) + password
router.post("/login", loginLimiter, login);

// GET /api/auth/me — return current user profile (JWT required)
router.get("/me", authMiddleware, getMe);

// POST /api/auth/change-password (JWT required)
router.post("/change-password", authMiddleware, changePassword);

module.exports = router;

