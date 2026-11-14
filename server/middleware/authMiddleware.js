/**
 * authMiddleware.js
 *
 * Verifies the JWT from "Authorization: Bearer <token>",
 * loads the full user document (excluding passwordHash), and
 * attaches it to req.user.
 *
 * Rejects with 401 if:
 *   - No / malformed token
 *   - Token signature invalid or expired
 *   - User no longer exists in DB
 *   - User account is inactive (isActive: false)
 */

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  try {
    // Explicitly select passwordHash exclusion is baked into the schema (select:false)
    const user = await User.findById(payload.id).select("-passwordHash");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account has been deactivated" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = authMiddleware;

