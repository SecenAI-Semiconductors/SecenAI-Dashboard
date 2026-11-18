/**
 * farmerProfileController.js
 *
 * GET /api/farmer/me/profile   — read own profile + crops
 * PUT /api/farmer/me/profile   — update own profile + crops
 *
 * Security:
 *   - req.user._id is ALWAYS the source of truth.
 *   - Whitelist: name, village, district, state, totalLandArea, crops, email, language.
 *   - NEVER accepted: phone, role, isActive, passwordHash, _id, userId.
 *   - Farmer A cannot access Farmer B's data (always User.findById(req.user._id)).
 */

const User = require("../models/User");

// Canonical crop-name normalization map (lowercase key → stored value)
const CROP_CANONICAL = {
  "rice": "Rice (Paddy)",
  "paddy": "Rice (Paddy)",
  "rice (paddy)": "Rice (Paddy)",
  "redgram": "Redgram (Tur)",
  "tur": "Redgram (Tur)",
  "redgram (tur)": "Redgram (Tur)",
  "groundnut": "Groundnut",
  "cotton": "Cotton",
  "maize": "Maize",
  "chilli": "Chilli",
  "sugarcane": "Sugarcane",
  "turmeric": "Turmeric",
  "wheat": "Wheat",
  "soybean": "Soybean",
};

function normalizeCropName(raw) {
  const key = (raw || "").trim().toLowerCase();
  return CROP_CANONICAL[key] ?? raw.trim();
}

// ─────────────────────────────────────────────────────────────────
// GET /api/farmer/me/profile
// ─────────────────────────────────────────────────────────────────
exports.getMyProfile = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      id:            user._id,
      name:          user.fullName,
      phone:         user.phone || null,
      email:         user.email || null,
      village:       user.village       || null,
      district:      user.district      || null,
      state:         user.state         || null,
      language:      user.language,
      totalLandArea: user.totalLandArea,
      crops:         user.crops,
      createdAt:     user.createdAt,
    });
  } catch (error) {
    console.error("[farmer/me/profile GET]", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────────
// PUT /api/farmer/me/profile
// Whitelist: name, village, district, state, totalLandArea, crops, email, language.
// Silently ignores: phone, role, isActive, passwordHash, _id, userId.
// ─────────────────────────────────────────────────────────────────
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user._id; // always from JWT, never from body

    // Destructure ONLY the whitelisted fields
    const { name, village, district, state, totalLandArea, crops, email, language } = req.body;

    const updates = {};

    // name
    if (name !== undefined) {
      const trimmed = (name || "").trim();
      if (!trimmed) return res.status(400).json({ message: "Name cannot be empty" });
      updates.fullName = trimmed;
    }

    if (village  !== undefined) updates.village  = (village  || "").trim() || undefined;
    if (district !== undefined) updates.district = (district || "").trim() || undefined;
    if (state    !== undefined) updates.state    = (state    || "").trim() || undefined;
    if (language !== undefined) updates.language = language;

    // email — optional, unique; omit when empty
    if (email !== undefined) {
      const trimmedEmail = (email || "").trim().toLowerCase();
      if (trimmedEmail) {
        // Basic email format check
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
          return res.status(400).json({ message: "Invalid email address" });
        }
        // Check uniqueness (excluding self)
        const existing = await User.findOne({ email: trimmedEmail, _id: { $ne: userId } });
        if (existing) return res.status(409).json({ message: "Email already in use" });
        updates.email = trimmedEmail;
      } else {
        updates.email = undefined; // clear it
      }
    }

    // totalLandArea — must be > 0
    if (totalLandArea !== undefined) {
      const area = Number(totalLandArea);
      if (isNaN(area) || area <= 0) {
        return res.status(400).json({ message: "Total land area must be a number greater than 0" });
      }
      updates.totalLandArea = area;
    }

    // crops — validate and normalize
    if (crops !== undefined) {
      if (!Array.isArray(crops)) {
        return res.status(400).json({ message: "crops must be an array" });
      }
      for (const crop of crops) {
        if (!crop.name || typeof crop.name !== "string") {
          return res.status(400).json({ message: "Each crop must have a name" });
        }
        if (crop.area === undefined || isNaN(Number(crop.area)) || Number(crop.area) <= 0) {
          return res.status(400).json({ message: "Each crop must have a valid area > 0 (acres)" });
        }
      }

      // Normalize names
      const normalizedCrops = crops.map((c) => ({
        name:       normalizeCropName(c.name),
        area:       Number(c.area),
        season:     c.season     || undefined,
        sowingDate: c.sowingDate ? new Date(c.sowingDate) : undefined,
      }));

      // If totalLandArea is also being updated, use the new value; otherwise use current
      const landArea = updates.totalLandArea ?? req.user.totalLandArea;
      if (landArea > 0) {
        const cropAreaSum = normalizedCrops.reduce((s, c) => s + c.area, 0);
        if (cropAreaSum > landArea + 0.001) { // 0.001 tolerance for float rounding
          return res.status(400).json({
            message: `Crop areas total ${cropAreaSum.toFixed(2)} ac, which exceeds your total land area of ${landArea} ac. Reduce crop areas or increase total land area.`,
          });
        }
      }

      updates.crops = normalizedCrops;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided to update" });
    }

    updates.profileSetupRequired = false;

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      id:            updated._id,
      name:          updated.fullName,
      phone:         updated.phone || null,
      email:         updated.email || null,
      village:       updated.village       || null,
      district:      updated.district      || null,
      state:         updated.state         || null,
      language:      updated.language,
      profileSetupRequired: updated.profileSetupRequired,
      totalLandArea: updated.totalLandArea,
      crops:         updated.crops,
    });
  } catch (error) {
    console.error("[farmer/me/profile PUT]", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
