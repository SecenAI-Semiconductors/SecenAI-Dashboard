require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

connectDB();

const app = express();

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
    // Allow requests with no origin (e.g. mobile apps, server-to-server)
    // only in development. In production, block them.
    if (!origin) {
      if (process.env.NODE_ENV === "production") {
        return callback(new Error("CORS: No origin header — request blocked"));
      }
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

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/insurance", require("./routes/insuranceRoutes"));
app.use("/api/weather", require("./routes/weatherRoutes"));
app.use("/api/soil", require("./routes/soilRoutes"));

// ── Drone Operations (single consolidated router) ────────────────────────────
app.use("/api", require("./routes/droneOperationRoutes"));

// Global error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
