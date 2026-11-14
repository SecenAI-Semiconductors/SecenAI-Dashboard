/**
 * adminInsuranceRoutes.js
 *
 * Admin-only insurance endpoints.
 * All routes require JWT + role "admin".
 */

const express      = require("express");
const router       = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const requireRole    = require("../middleware/requireRole");
const {
  getAllInsuranceAdmin,
  getInsuranceRequest,
  approveInsurance,
  rejectInsurance,
  requestReviewInsurance,
} = require("../controllers/insuranceController");

// Guard every route in this file
router.use(authMiddleware, requireRole("admin"));

// GET  /api/admin/insurance         — all requests, with farmerName + farmerPhone
router.get("/",                 getAllInsuranceAdmin);

// GET  /api/admin/insurance/:id     — single request (admin read)
router.get("/:id",              getInsuranceRequest);

// PATCH /api/admin/insurance/:id/approve
router.patch("/:id/approve",    approveInsurance);

// PATCH /api/admin/insurance/:id/reject
router.patch("/:id/reject",     rejectInsurance);

// PATCH /api/admin/insurance/:id/review
router.patch("/:id/review",     requestReviewInsurance);

module.exports = router;

