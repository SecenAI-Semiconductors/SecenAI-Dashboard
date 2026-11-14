/**
 * adminFarmerRoutes.js
 *
 * Admin-only routes for farmer account management.
 * All routes require authMiddleware + requireRole("admin").
 */

const express       = require("express");
const router        = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const requireRole    = require("../middleware/requireRole");
const {
  createFarmer,
  resetFarmerPassword,
} = require("../controllers/adminFarmerController");

// Apply auth guards to every route in this file
router.use(authMiddleware, requireRole("admin"));

// POST /api/admin/farmers — create a new farmer account
router.post("/", createFarmer);

// POST /api/admin/farmers/:id/reset-password — reset a farmer's password
router.post("/:id/reset-password", resetFarmerPassword);

module.exports = router;

