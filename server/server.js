/* Deploy stamp: forces Vercel to rebuild the serverless function */
const DEPLOY_STAMP = "2026-09-22T23:30Z";
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

connectDB();

const app = express();

// Trust the first proxy hop (Vercel / reverse proxies) so that
// req.ip resolves to the real client IP via X-Forwarded-For,
// rather than the proxy's IP (which would make every user share one rate-limit bucket).
app.set("trust proxy", 1);

/* ── Allowed frontend origins ── */
const allowedOrigins = [
  process.env.CLIENT_URL,       // Production frontend URL (set in Vercel env vars)
  "http://localhost:5173",       // Local Vite dev server
  "http://localhost:5174",       // Vite fallback port (when 5173 is occupied)
  "http://localhost:3000",       // Alternate local dev port
].filter(Boolean);               // Remove undefined values

// Regex to match Vercel preview deployment URLs for this project
const vercelPreviewRegex = /^https:\/\/secen-ai-dashboard[a-z0-9-]*\.vercel\.app$/;

/* ── CORS configuration ── */
const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (health checks, server-to-server, curl/Postman).
    // Browser cross-origin requests will always have an origin header, so this is safe.
    if (!origin) {
      return callback(null, true);
    }

    // Check static allowlist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check Vercel preview deployment URLs
    if (vercelPreviewRegex.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Explicitly handle preflight OPTIONS for all routes
// path-to-regexp v8 (used by Express 5) requires {*path} named wildcard syntax
app.options("/{*path}", cors(corsOptions));

app.use(express.json());

/* ── API Key middleware — protects /api routes from direct access ── */
app.use("/api", (req, res, next) => {
  // Skip API key check in development for convenience
  if (process.env.NODE_ENV !== "production") {
    return next();
  }

  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid or missing API key" });
  }

  next();
});

// Health check endpoint for deployment platforms
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Temporary debug endpoint — remove after diagnosing Vercel 500s
app.get("/debug", (req, res) => {
  res.status(200).json({
    deployStamp: DEPLOY_STAMP,
    nodeVersion: process.version,
    expressVersion: require("express/package.json").version,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      MONGO_URI_SET: Boolean(process.env.MONGO_URI),
      GEMINI_API_KEY_SET: Boolean(process.env.GEMINI_API_KEY),
      GEMINI_MODEL: process.env.GEMINI_MODEL || "(default)",
      API_SECRET_KEY_SET: Boolean(process.env.API_SECRET_KEY),
      CLIENT_URL: process.env.CLIENT_URL,
      VERCEL: process.env.VERCEL,
    },
  });
});

// ── Authentication (public + JWT-protected) ──────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));

// ── Farmer self-service profile + insurance (JWT + farmer role required) ──────
app.use("/api/farmer", require("./routes/farmerRoutes"));

// ── Admin farmer management (JWT + admin role required) ──────────────────────
app.use("/api/admin/farmers", require("./routes/adminFarmerRoutes"));

// ── Admin self-service profile (JWT + admin role required) ────────────────────
app.use("/api/admin/me", require("./routes/adminMeRoutes"));

// ── Admin insurance management (JWT + admin role required) ───────────────────
app.use("/api/admin/insurance", require("./routes/adminInsuranceRoutes"));

// ── Admin analytics (JWT + admin role required) ───────────────────────────────
app.use("/api/admin/analytics", require("./routes/adminAnalyticsRoutes"));

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/weather", require("./routes/weatherRoutes"));
app.use("/api/ai-assistant", require("./routes/aiAssistantRoutes"));
app.use("/api/soil", require("./routes/soilRoutes"));

// ── Market price proxy (server-side → data.gov.in, no CORS) ─────────────────
// Must be mounted BEFORE the drone catch-all (/api) to avoid its auth guard.
app.use("/api/market", require("./routes/marketProxyRoutes"));

// ── Drone Operations (single consolidated router) ────────────────────────────
app.use("/api", require("./routes/droneOperationRoutes"));

// ── Disease & Pest Analytics (admin read-only aggregation) ───────────────────
app.use("/api/admin/disease-analytics", require("./routes/adminDiseaseAnalyticsRoutes"));

// Global error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message,
    // Temporarily expose stack in production to diagnose Vercel 500s
    // TODO: revert to "Internal server error" after fix
    stack: process.env.NODE_ENV === "production" ? err.stack?.split("\n").slice(0, 5) : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

module.exports = app;
