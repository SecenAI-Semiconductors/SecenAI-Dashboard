const InsuranceRequest = require("../models/InsuranceRequest");
const User             = require("../models/User");

// ─── FARMER-SCOPED ACTIONS ─────────────────────────────────────────────────
// farmerId is ALWAYS taken from req.user._id — never from the request body.

/** POST /api/farmer/insurance — create a request for the logged-in farmer */
exports.createInsuranceFarmer = async (req, res) => {
  try {
    const farmer = await User.findById(req.user._id).select("fullName");
    if (!farmer) return res.status(404).json({ message: "Farmer not found" });

    const {
      cropName, cropType, cropSeason, landArea, soilType,
      irrigationType, district, state, sowingDate,
      expectedHarvestDate, estimatedYield, requestedCoverage,
    } = req.body;

    if (
      !cropName || !cropType || !cropSeason || !landArea || !soilType ||
      !irrigationType || !district || !state || !sowingDate ||
      !expectedHarvestDate || !estimatedYield || !requestedCoverage
    ) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const estimatedInsurancePremium = Number(requestedCoverage) * 0.02;

    const insuranceRequest = await InsuranceRequest.create({
      farmerId:  req.user._id,          // always from token
      farmerName: farmer.fullName,       // always from DB
      cropName, cropType, cropSeason, landArea, soilType,
      irrigationType, district, state, sowingDate,
      expectedHarvestDate, estimatedYield, requestedCoverage,
      estimatedInsurancePremium,
      status: "Pending",
    });

    res.status(201).json(insuranceRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** GET /api/farmer/insurance — own requests only */
exports.getMyInsurance = async (req, res) => {
  try {
    const requests = await InsuranceRequest
      .find({ farmerId: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** GET /api/farmer/insurance/:id — own request by ID (ownership enforced) */
exports.getMyInsuranceById = async (req, res) => {
  try {
    const request = await InsuranceRequest.findOne({
      _id: req.params.id,
      farmerId: req.user._id,
    });
    if (!request) return res.status(404).json({ message: "Insurance request not found" });
    res.status(200).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** PUT /api/farmer/insurance/:id — update own request (ownership enforced) */
exports.updateMyInsurance = async (req, res) => {
  try {
    // Disallow changing farmerId or farmerName via body
    const { farmerId: _f, farmerName: _n, status: _s, ...safeBody } = req.body;

    const request = await InsuranceRequest.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user._id },
      {
        $set: { ...safeBody, status: "Resubmitted", adminRemarks: "" },
        $push: { reviewHistory: { action: "Resubmitted", remarks: "Farmer updated application details" } },
      },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: "Insurance request not found" });
    res.status(200).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** DELETE /api/farmer/insurance/:id — delete own request (ownership enforced) */
exports.deleteMyInsurance = async (req, res) => {
  try {
    const request = await InsuranceRequest.findOneAndDelete({
      _id: req.params.id,
      farmerId: req.user._id,
    });
    if (!request) return res.status(404).json({ message: "Insurance request not found" });
    res.status(200).json({ message: "Insurance request deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── ADMIN-SCOPED ACTIONS ──────────────────────────────────────────────────

/** GET /api/admin/insurance — all requests, populated with farmer name + phone */
exports.getAllInsuranceAdmin = async (req, res) => {
  try {
    const requests = await InsuranceRequest
      .find()
      .sort({ createdAt: -1 })
      .populate("farmerId", "fullName phone");

    // Flatten: attach farmerPhone from populated ref into each doc's plain object
    const data = requests.map((r) => {
      const obj = r.toObject();
      obj.farmerPhone = obj.farmerId?.phone ?? null;
      obj.farmerName  = obj.farmerId?.fullName ?? obj.farmerName;
      return obj;
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
