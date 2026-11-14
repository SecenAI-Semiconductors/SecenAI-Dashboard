const express       = require("express");
const router        = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const requireRole    = require("../middleware/requireRole");
const {
  getMyProfile,
  updateMyProfile,
} = require("../controllers/farmerProfileController");
const {
  createInsuranceFarmer,
  getMyInsurance,
  getMyInsuranceById,
  updateMyInsurance,
  deleteMyInsurance,
} = require("../controllers/insuranceController");

// Apply auth guards to every route in this file
router.use(authMiddleware, requireRole("farmer"));

// GET /api/farmer/me/profile — read own profile + crops + land area
router.get("/me/profile", getMyProfile);

// PUT /api/farmer/me/profile — update own profile (whitelisted fields only)
router.put("/me/profile", updateMyProfile);

// ── Crop Insurance (farmer-scoped) ────────────────────────────────────────
// farmerId is NEVER accepted from the request — always taken from req.user._id.

router.post("/insurance",      createInsuranceFarmer);
router.get("/insurance",       getMyInsurance);
router.get("/insurance/:id",   getMyInsuranceById);
router.put("/insurance/:id",   updateMyInsurance);
router.delete("/insurance/:id", deleteMyInsurance);

module.exports = router;

