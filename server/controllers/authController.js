/**
 * authController.js
 *
 * Handles:
 *   POST /api/auth/register        — farmer self-registration
 *   POST /api/auth/login           — email (admin) or phone (farmer)
 *   GET  /api/auth/me              — current user profile
 *   POST /api/auth/change-password — update own password
 */

const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const User   = require("../models/User");
const { normalizePhone, isValidIndianPhone } = require("../utils/phone");

// ── Helper: sign a 7-day JWT ──────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
    algorithm: "HS256",
  });
}

// ── Helper: safe user projection for responses ────────────────────
function safeUser(user) {
  return {
    id:                user._id,
    name:              user.fullName,
    role:              user.role,
    email:             user.email  || null,
    phone:             user.phone  || null,
    mustChangePassword: user.mustChangePassword,
    isActive:          user.isActive,
  };
}

// ─────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Public endpoint for farmer self-registration.
// Strictly whitelists: name, phone, password, district, state.
// Server forces role="farmer" — any other role in the body is ignored.
// ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    // Whitelist — ignore all other body fields (especially "role")
    const { name, phone, password, district, state } = req.body;

    // ── Validate required fields ──
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    if (!password || typeof password !== "string") {
      return res.status(400).json({ message: "Password is required" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    // ── Normalise and validate phone ──
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return res.status(400).json({
        message:
          "Invalid phone number. Enter a valid 10-digit Indian mobile number.",
      });
    }

    // ── Check for duplicate phone ──
    const existing = await User.findOne({ phone: normalizedPhone });
    if (existing) {
      return res.status(409).json({
        message: "An account with this phone number already exists",
      });
    }

    // ── Hash password ──
    const passwordHash = await bcrypt.hash(password, 12);

    // ── Create farmer — role ALWAYS "farmer" regardless of body ──
    const user = await User.create({
      fullName:          name.trim(),
      phone:             normalizedPhone,
      passwordHash,
      role:              "farmer",   // hard-coded; body is ignored for role
      isActive:          true,
      mustChangePassword: false,
      district:          district?.trim() || undefined,
      state:             state?.trim()    || undefined,
    });

    const token = signToken(user._id);

    return res.status(201).json({
      token,
      user: safeUser(user),
    });
  } catch (error) {
    console.error("[auth/register]", error.message);
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this phone number already exists",
      });
    }
    return res.status(500).json({ message: "Registration failed" });
  }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/auth/login
// identifier = email (admin) or phone number (farmer)
// Always returns "Invalid credentials" on any failure (no enumeration).
// ─────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const GENERIC_ERROR = "Invalid credentials";

  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(401).json({ message: GENERIC_ERROR });
    }

    let user;

    // ── Try email match first (admin path) ──
    const emailCandidate = identifier.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(emailCandidate)) {
      user = await User.findOne({ email: emailCandidate }).select(
        "+passwordHash"
      );
    }

    // ── Fall back to phone match (farmer path) ──
    if (!user) {
      const normalizedPhone = normalizePhone(identifier);
      if (normalizedPhone) {
        user = await User.findOne({ phone: normalizedPhone }).select(
          "+passwordHash"
        );
      }
    }

    // ── No user found ──
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: GENERIC_ERROR });
    }

    // ── Wrong password ──
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: GENERIC_ERROR });
    }

    // ── Inactive account ──
    if (!user.isActive) {
      return res.status(401).json({ message: GENERIC_ERROR });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      token,
      user: safeUser(user),
    });
  } catch (error) {
    console.error("[auth/login]", error.message);
    return res.status(500).json({ message: "Login failed" });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/auth/me
// Returns the current user's profile (all non-sensitive fields).
// ─────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    // req.user is already loaded by authMiddleware (no passwordHash)
    const user = req.user;

    return res.status(200).json({
      id:                user._id,
      name:              user.fullName,
      role:              user.role,
      email:             user.email  || null,
      phone:             user.phone  || null,
      mustChangePassword: user.mustChangePassword,
      isActive:          user.isActive,
      language:          user.language,
      village:           user.village   || null,
      district:          user.district  || null,
      state:             user.state     || null,
      totalLandArea:     user.totalLandArea,
      crops:             user.crops,
      status:            user.status,
      createdAt:         user.createdAt,
    });
  } catch (error) {
    console.error("[auth/me]", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/auth/change-password
// Body: { currentPassword, newPassword }
// ─────────────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "currentPassword and newPassword are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters",
      });
    }

    // Reload with passwordHash (select:false by default)
    const user = await User.findById(req.user._id).select("+passwordHash");
    if (!user || !user.passwordHash) {
      return res.status(400).json({ message: "Password not set on this account" });
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.passwordHash      = await bcrypt.hash(newPassword, 12);
    user.mustChangePassword = false;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("[auth/change-password]", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

