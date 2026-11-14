const express = require("express");
const router  = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const requireRole   = require("../middleware/requireRole");
const { getCropYieldAnalytics } = require("../controllers/adminAnalyticsController");

// All analytics routes: JWT + admin
router.use(authMiddleware, requireRole("admin"));

router.get("/crop-yield", getCropYieldAnalytics);

module.exports = router;

