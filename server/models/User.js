const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "farmer",
      enum: ["farmer", "admin"],
    },

    language: {
      type: String,
      default: "English",
    },

    district: {
      type: String,
    },

    state: {
      type: String,
    },

    totalLandArea: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);