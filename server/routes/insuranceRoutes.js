const express = require("express");

const router = express.Router();

const {
  createInsurance,
  getInsuranceRequests,
  getInsuranceRequest,
  updateInsurance,
  deleteInsurance,
  approveInsurance,
  rejectInsurance,
  requestReviewInsurance,
  getInsuranceByFarmerId,
} = require("../controllers/insuranceController");

router.post("/", createInsurance);

router.get("/", getInsuranceRequests);

router.get("/farmer/:farmerId", getInsuranceByFarmerId);

router.get("/:id", getInsuranceRequest);

router.put("/:id", updateInsurance);

router.delete("/:id", deleteInsurance);

// Admin actions
router.patch("/:id/approve", approveInsurance);
router.patch("/:id/reject", rejectInsurance);
router.patch("/:id/review", requestReviewInsurance);

module.exports = router;
