/**
 * adminMeController.js
 *
 * PUT /api/admin/me  — admin updates own name/email.
 *   - JWT + admin role required (enforced by route).
 *   - Whitelist: name, email (changing email requires currentPassword).
 *   - NEVER creates other admins or accepts role/isActive/passwordHash.
 */

const User   = require("../models/User");
const bcrypt = require("bcryptjs");

exports.updateAdminMe = async (req, res) => {
  try {
    const userId = req.user._id; // always from JWT

    const { name, email, currentPassword } = req.body;
    const updates = {};

    if (name !== undefined) {
      const trimmed = (name || "").trim();
      if (!trimmed) return res.status(400).json({ message: "Name cannot be empty" });
      updates.fullName = trimmed;
    }

    if (email !== undefined) {
      const trimmedEmail = (email || "").trim().toLowerCase();
      if (!trimmedEmail) return res.status(400).json({ message: "Email cannot be empty" });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return res.status(400).json({ message: "Invalid email address" });
      }

      const currentEmail = (req.user.email || "").trim().toLowerCase();
      // Only require password verification if email is actually changing
      if (trimmedEmail !== currentEmail) {
        if (!currentPassword) {
          return res.status(400).json({ message: "Current password is required to change email" });
        }

        // Verify password
        const userWithPw = await User.findById(userId).select("+passwordHash");
        if (!userWithPw) return res.status(404).json({ message: "User not found" });
        const match = await bcrypt.compare(currentPassword, userWithPw.passwordHash);
        if (!match) return res.status(401).json({ message: "Current password is incorrect" });

        // Check uniqueness
        const existing = await User.findOne({ email: trimmedEmail, _id: { $ne: userId } });
        if (existing) return res.status(409).json({ message: "Email already in use" });

        updates.email = trimmedEmail;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided to update" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      id:    updated._id,
      name:  updated.fullName,
      email: updated.email,
      role:  updated.role,
    });
  } catch (error) {
    console.error("[admin/me PUT]", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

