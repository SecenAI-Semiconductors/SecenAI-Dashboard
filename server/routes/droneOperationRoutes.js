const express = require("express");
const router  = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const requireRole   = require("../middleware/requireRole");

const {
  getDrones,      updateDrone,
  getOperators,
  getFields,
  getFlights,     createFlight,
  getMissions,    getMissionById,
  getFarmerForDrone, getFarmersForDrone,
} = require("../controllers/droneOperationController");

// All drone routes require JWT + admin
router.use(authMiddleware, requireRole("admin"));

// ── Farmer lookup (for FlightScheduling UI) ───────────────────────
router.get("/admin/drone/farmers",           getFarmersForDrone);
router.get("/admin/drone/farmer/:farmerId",  getFarmerForDrone);

// ── Drones ────────────────────────────────────────────────────────
router.get("/drones",        getDrones);
router.patch("/drones/:id",  updateDrone);

// ── Operators ─────────────────────────────────────────────────────
router.get("/operators",     getOperators);

// ── Fields ────────────────────────────────────────────────────────
router.get("/fields",        getFields);

// ── Flights ───────────────────────────────────────────────────────
router.get("/flights",       getFlights);
router.post("/flights",      createFlight);

// ── Missions ──────────────────────────────────────────────────────
router.get("/missions",      getMissions);
router.get("/missions/:id",  getMissionById);

module.exports = router;
