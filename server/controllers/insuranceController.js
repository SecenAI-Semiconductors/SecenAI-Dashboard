const InsuranceRequest = require("../models/InsuranceRequest");

exports.createInsurance = async (req, res) => {
  try {
    const {
      farmerId,
      farmerName,
      cropName,
      cropType,
      cropSeason,
      landArea,
      soilType,
      irrigationType,
      district,
      state,
      sowingDate,
      expectedHarvestDate,
      estimatedYield,
      requestedCoverage,
    } = req.body;

    // Validate required fields
    if (
      !farmerId ||
      !farmerName ||
      !cropName ||
      !cropType ||
      !cropSeason ||
      !landArea ||
      !soilType ||
      !irrigationType ||
      !district ||
      !state ||
      !sowingDate ||
      !expectedHarvestDate ||
      !estimatedYield ||
      !requestedCoverage
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // Static premium calculation: Coverage × 2%
    const estimatedInsurancePremium = requestedCoverage * 0.02;

    const insuranceRequest = await InsuranceRequest.create({
      farmerId,
      farmerName,
      cropName,
      cropType,
      cropSeason,
      landArea,
      soilType,
      irrigationType,
      district,
      state,
      sowingDate,
      expectedHarvestDate,
      estimatedYield,
      requestedCoverage,
      estimatedInsurancePremium,
      status: "Pending",
    });

    res.status(201).json(insuranceRequest);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


exports.getInsuranceRequests = async (req, res) => {
  try {
    const requests = await InsuranceRequest.find().sort({
      createdAt: -1,
    });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


exports.getInsuranceRequest = async (req, res) => {
  try {
    const request = await InsuranceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Insurance request not found",
      });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


exports.updateInsurance = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // If updating a "Review Required" application, it becomes "Resubmitted"
    updateData.status = "Resubmitted";
    updateData.adminRemarks = "";

    const request = await InsuranceRequest.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateData,
        $push: {
          reviewHistory: {
            action: "Resubmitted",
            remarks: "Farmer updated application details",
          }
        }
      },
      {
        new: true,
      }
    );

    if (!request) {
      return res.status(404).json({
        message: "Insurance request not found",
      });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


exports.deleteInsurance = async (req, res) => {
  try {
    const request = await InsuranceRequest.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Insurance request not found",
      });
    }

    res.status(200).json({
      message: "Insurance request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Admin Actions
exports.approveInsurance = async (req, res) => {
  try {
    const { adminRemarks } = req.body;
    
    const request = await InsuranceRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "Approved",
        adminRemarks: adminRemarks || "Application Approved",
        $push: {
          reviewHistory: {
            action: "Approved",
            remarks: adminRemarks || "Application Approved",
          }
        }
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Insurance request not found" });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectInsurance = async (req, res) => {
  try {
    const { adminRemarks } = req.body;
    
    if (!adminRemarks) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const request = await InsuranceRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "Rejected",
        adminRemarks,
        $push: {
          reviewHistory: {
            action: "Rejected",
            remarks: adminRemarks,
          }
        }
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Insurance request not found" });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.requestReviewInsurance = async (req, res) => {
  try {
    const { adminRemarks } = req.body;
    
    if (!adminRemarks) {
      return res.status(400).json({ message: "Review remarks are required" });
    }

    const request = await InsuranceRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "Review Required",
        adminRemarks,
        $push: {
          reviewHistory: {
            action: "Review Required",
            remarks: adminRemarks,
          }
        }
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Insurance request not found" });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Farmer specific fetch
exports.getInsuranceByFarmerId = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const requests = await InsuranceRequest.find({ farmerId }).sort({
      createdAt: -1,
    });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
