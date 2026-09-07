const mongoose = require("mongoose");

const soilReadingSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ph: {
      type: Number,
      required: true,
    },
    moisture: {
      type: Number,
      required: true,
    },
    nitrogen: {
      type: Number, // mg/kg
      required: true,
    },
    phosphorus: {
      type: Number, // mg/kg
      required: true,
    },
    potassium: {
      type: Number, // mg/kg
      required: true,
    },
    organicCarbon: {
      type: Number, // percentage
      required: true,
    },
    electricalConductivity: {
      type: Number, // dS/m
      required: true,
    },
    soilType: {
      type: String,
      required: true,
      enum: ["Alluvial", "Black", "Red", "Laterite", "Sandy", "Clay", "Loamy"],
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SoilReading", soilReadingSchema);
