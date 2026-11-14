/**
 * User.js — single collection for both admins and farmers.
 *
 * Auth fields added:
 *   passwordHash     (select:false — never returned in queries)
 *   isActive         (boolean, default true — set false to block login)
 *   mustChangePassword (boolean — set true for admin-created accounts)
 *
 * Index rules:
 *   email  — unique, sparse, lowercase.  Required for admin; optional for farmer.
 *   phone  — unique, sparse.             Required for farmer; optional for admin.
 *
 * "sparse" means the unique constraint is only enforced for documents that
 * actually contain the field (null / missing values are excluded), so
 * multiple farmers can omit email without a unique collision.
 *
 * Pre-save validation enforces:
 *   admin  → must have email
 *   farmer → must have phone
 */

const mongoose = require("mongoose");

// ── Crop sub-document ──────────────────────────────────────────────
const cropSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    area:       { type: Number, required: true, min: 0 },   // acres
    season:     { type: String, trim: true },
    sowingDate: { type: Date },
  },
  { _id: true }
);

// ── User schema ────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },

    // Email — required for admin; optional (sparse-unique) for farmer.
    // unique + sparse indexes are declared via schema.index() below.
    email: {
      type:      String,
      lowercase: true,
      trim:      true,
    },

    // Phone — required for farmer; optional (sparse-unique) for admin.
    // Always stored as a normalised 10-digit Indian mobile number.
    phone: {
      type: String,
      trim: true,
    },

    // ── Auth ──────────────────────────────────────────────────────
    passwordHash: {
      type:   String,
      select: false,  // never included in queries unless explicitly requested
    },

    isActive: {
      type:    Boolean,
      default: true,
    },

    mustChangePassword: {
      type:    Boolean,
      default: false,
    },

    // ── Role ──────────────────────────────────────────────────────
    role: {
      type:    String,
      default: "farmer",
      enum:    ["farmer", "admin"],
    },

    // ── Farmer profile fields ─────────────────────────────────────
    language: {
      type:    String,
      default: "English",
    },

    profileSetupRequired: {
      type:    Boolean,
      default: false,
    },

    village: {
      type: String,
      trim: true,
    },

    district: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    totalLandArea: {
      type:    Number,
      default: 0,
      min:     0,
    },

    crops: [cropSchema],

    // ── Legacy status field (kept for backward compat with existing UI) ──
    status: {
      type:    String,
      default: "active",
      enum:    ["active", "inactive"],
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ────────────────────────────────────────────────────────
// sparse:true means only documents where the field exists are indexed,
// allowing multiple documents to omit the field without collision.
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

// ── Pre-save validation ────────────────────────────────────────────
userSchema.pre("save", async function () {
  if (this.role === "admin" && !this.email) {
    throw new Error("Admin accounts require an email address");
  }
  if (this.role === "farmer" && !this.phone) {
    throw new Error("Farmer accounts require a phone number");
  }

  // Prevent storing empty-string email (sparse unique requires null/missing)
  if (this.email === "") this.email = undefined;
  if (this.phone === "") this.phone = undefined;
});

module.exports = mongoose.model("User", userSchema);
