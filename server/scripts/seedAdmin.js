/**
 * scripts/seedAdmin.js
 *
 * Creates the first admin account if none exists.
 * Reads credentials exclusively from environment variables — never from code.
 *
 * Required env vars:
 *   ADMIN_EMAIL     — email address for the admin account
 *   ADMIN_PASSWORD  — initial password (min 8 chars)
 *   MONGO_URI       — MongoDB Atlas connection string
 *
 * Usage:
 *   node scripts/seedAdmin.js
 *
 * Safe to re-run — exits cleanly if an admin already exists.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const dns      = require("dns");

// Use Google DNS so MongoDB SRV lookups resolve in dev (same as db.js)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const User = require("../models/User");

// ── Validate required env vars before connecting ──────────────────
const { ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI } = process.env;

if (!MONGO_URI) {
  console.error("❌  MONGO_URI is not set in the environment");
  process.exit(1);
}

if (!ADMIN_EMAIL || !ADMIN_EMAIL.includes("@")) {
  console.error("❌  ADMIN_EMAIL is not set or invalid");
  process.exit(1);
}

if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  console.error("❌  ADMIN_PASSWORD is not set or is shorter than 8 characters");
  process.exit(1);
}

async function seedAdmin() {
  console.log("\n🌱  Admin Seed Script");
  console.log("─────────────────────────────────");

  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected to MongoDB\n");

  // Check whether any admin already exists
  const existingAdmin = await User.findOne({ role: "admin" });

  if (existingAdmin) {
    console.log(
      `ℹ️   Admin already exists (email: ${existingAdmin.email}) — skipping creation.`
    );
    await mongoose.disconnect();
    process.exit(0);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // Create admin
  const admin = await User.create({
    fullName:           "Platform Admin",
    email:              ADMIN_EMAIL.toLowerCase().trim(),
    passwordHash,
    role:               "admin",
    isActive:           true,
    mustChangePassword: false,
  });

  console.log("✅  Admin account created successfully");
  console.log(`   Email : ${admin.email}`);
  console.log(`   ID    : ${admin._id}`);
  console.log("\n⚠️   Change the admin password after first login.\n");

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});

