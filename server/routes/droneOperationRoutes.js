const express = require("express");
const router  = express.Router();

const {
  getDrones,      updateDrone,
  getOperators,
  getFields,
  getFlights,     createFlight,
  getMissions,    getMissionById,
} = require("../controllers/droneOperationController");

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
