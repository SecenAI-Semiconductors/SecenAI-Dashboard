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
      remarks: "Awaiting Admin Review",
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
    const request = await InsuranceRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
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
