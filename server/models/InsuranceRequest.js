const mongoose = require("mongoose");

const insuranceRequestSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    farmerName: {
      type: String,
      required: true,
    },

    cropName: {
      type: String,
      required: true,
    },

    cropType: {
      type: String,
      required: true,
      enum: ["Kharif", "Rabi", "Zaid", "Cash Crop", "Horticulture"],
    },

    cropSeason: {
      type: String,
      required: true,
      enum: ["Kharif", "Rabi", "Zaid", "Summer", "Whole Year"],
    },

    landArea: {
      type: Number,
      required: true,
    },

    soilType: {
      type: String,
      required: true,
      enum: ["Alluvial", "Black", "Red", "Laterite", "Sandy", "Clay", "Loamy"],
    },

    irrigationType: {
      type: String,
      required: true,
      enum: ["Rainfed", "Canal", "Borewell", "Drip", "Sprinkler", "Flood"],
    },

    district: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    sowingDate: {
      type: Date,
      required: true,
    },

    expectedHarvestDate: {
      type: Date,
      required: true,
    },

    estimatedYield: {
      type: Number,
      required: true,
    },

    requestedCoverage: {
      type: Number,
      required: true,
    },

    estimatedInsurancePremium: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Review Required", "Resubmitted", "Approved", "Rejected"],
    },

    adminRemarks: {
      type: String,
      default: "",
    },

    reviewHistory: [
      {
        action: String,
        remarks: String,
        reviewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("InsuranceRequest", insuranceRequestSchema);
