/**
 * adminFarmerController.js
 *
 * Admin-only operations on farmer accounts:
 *
 *   POST /api/admin/farmers
 *     Creates a User(role=farmer, mustChangePassword=true) + returns a
 *     one-time temporary password in the response so the admin can hand
 *     it to the farmer.  The plain-text password is NEVER stored or logged.
 *
 *   POST /api/admin/farmers/:id/reset-password
 *     Generates a new temporary password for an existing farmer and
 *     returns it once.
 *
 * Security:
 *   - These routes are protected by authMiddleware + requireRole("admin").
 *   - Farmers' ids are taken from route params (not body), which the admin
 *     cannot spoof to escalate privileges.
 *   - Admin accounts cannot be created through these endpoints.
 */

const bcrypt = require("bcryptjs");
const User   = require("../models/User");
const { normalizePhone } = require("../utils/phone");
const { generateTempPassword } = require("../utils/tempPassword");

// ─────────────────────────────────────────────────────────────────
// POST /api/admin/farmers
// Body: { name, phone, district?, state?, village?, language?, totalLandArea? }
// Returns: { farmer, temporaryPassword }
// ─────────────────────────────────────────────────────────────────
exports.createFarmer = async (req, res) => {
  try {
    // Whitelist body fields — ignore anything else (especially role)
    const {
      name,
      phone,
      district,
      state,
      village,
      language,
      totalLandArea,
    } = req.body;

    // ── Validate required fields ──
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Farmer name is required" });
    }

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return res.status(400).json({
        message: "Invalid phone number. Enter a valid 10-digit Indian mobile number.",
      });
    }

    // ── Check for duplicate phone ──
    const existing = await User.findOne({ phone: normalizedPhone });
    if (existing) {
      return res.status(409).json({
        message: "An account with this phone number already exists",
      });
    }

    // ── Generate and hash temporary password ──
    const temporaryPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    // ── Create farmer account ──
    const farmer = await User.create({
      fullName:           name.trim(),
      phone:              normalizedPhone,
      passwordHash,
      role:               "farmer",        // always farmer — never admin
      isActive:           true,
      mustChangePassword: true,            // farmer must change on first login
      district:           district?.trim()     || undefined,
      state:              state?.trim()         || undefined,
      village:            village?.trim()       || undefined,
      language:           language             || "English",
      totalLandArea:      totalLandArea !== undefined ? Number(totalLandArea) : 0,
    });

    return res.status(201).json({
      farmer: {
        id:       farmer._id,
        name:     farmer.fullName,
        phone:    farmer.phone,
        role:     farmer.role,
        district: farmer.district || null,
        state:    farmer.state    || null,
        mustChangePassword: farmer.mustChangePassword,
      },
      temporaryPassword, // returned ONCE — never stored in plain text
    });
  } catch (error) {
    console.error("[admin/farmers POST]", error.message);
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this phone number already exists",
      });
    }
    return res.status(500).json({ message: "Failed to create farmer account" });
  }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/admin/farmers/:id/reset-password
// Returns: { temporaryPassword }
// ─────────────────────────────────────────────────────────────────
exports.resetFarmerPassword = async (req, res) => {
  try {
    const farmer = await User.findById(req.params.id);

    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // Prevent resetting an admin's password through this endpoint
    if (farmer.role !== "farmer") {
      return res.status(403).json({
        message: "This endpoint only resets farmer passwords",
      });
    }

    const temporaryPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    farmer.passwordHash      = passwordHash;
    farmer.mustChangePassword = true;
    await farmer.save();

    return res.status(200).json({ temporaryPassword }); // returned ONCE
  } catch (error) {
    console.error("[admin/farmers/:id/reset-password]", error.message);
    return res.status(500).json({ message: "Failed to reset password" });
  }
};

