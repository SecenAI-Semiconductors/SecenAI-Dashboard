const express = require("express");

const router = express.Router();

const {
  createInsurance,
  getInsuranceRequests,
  getInsuranceRequest,
  updateInsurance,
  deleteInsurance,
} = require("../controllers/insuranceController");

router.post("/", createInsurance);

router.get("/", getInsuranceRequests);

router.get("/:id", getInsuranceRequest);

router.put("/:id", updateInsurance);

router.delete("/:id", deleteInsurance);

module.exports = router;
