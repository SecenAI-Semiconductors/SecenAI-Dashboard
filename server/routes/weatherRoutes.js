const express = require("express");
const {
  postWeatherIntelligence,
} = require("../controllers/weatherIntelligenceController");

const router = express.Router();

// POST /api/weather/intelligence
router.post("/intelligence", postWeatherIntelligence);

module.exports = router;
