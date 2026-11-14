const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const requireRole   = require("../middleware/requireRole");

const {
  getOverview,
  getOutbreaks,
  getHeatmap,
  getTreatmentEffectiveness,
  getCases,
  getCaseById,
} = require("../controllers/adminDiseaseAnalyticsController");

// ── Disease & Pest Analytics (JWT + admin required) ────────────────
router.use(authMiddleware, requireRole("admin"));

router.get("/overview",                 getOverview);
router.get("/outbreaks",                getOutbreaks);
router.get("/heatmap",                  getHeatmap);
router.get("/treatment-effectiveness",  getTreatmentEffectiveness);
router.get("/cases",                    getCases);
router.get("/cases/:id",               getCaseById);

module.exports = router;
