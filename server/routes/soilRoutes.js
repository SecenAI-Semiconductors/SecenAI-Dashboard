const express = require("express");
const router = express.Router();

const {
  createSoilReading,
  getLatestByFarmer,
  getHistoryByFarmer,
} = require("../controllers/soilController");

router.post("/", createSoilReading);
router.get("/:farmerId", getLatestByFarmer);
router.get("/:farmerId/history", getHistoryByFarmer);

module.exports = router;
