const SoilReading = require("../models/SoilReading");

exports.createSoilReading = async (req, res) => {
  try {
    const {
      farmerId,
      ph,
      moisture,
      nitrogen,
      phosphorus,
      potassium,
      organicCarbon,
      electricalConductivity,
      soilType,
      recordedAt,
    } = req.body;

    if (
      !farmerId ||
      ph === undefined ||
      moisture === undefined ||
      nitrogen === undefined ||
      phosphorus === undefined ||
      potassium === undefined ||
      organicCarbon === undefined ||
      electricalConductivity === undefined ||
      !soilType
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const reading = await SoilReading.create({
      farmerId,
      ph,
      moisture,
      nitrogen,
      phosphorus,
      potassium,
      organicCarbon,
      electricalConductivity,
      soilType,
      recordedAt: recordedAt || Date.now(),
    });

    res.status(201).json(reading);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getLatestByFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    // Find the most recent reading for this farmer
    const reading = await SoilReading.findOne({ farmerId })
      .sort({ recordedAt: -1 });

    if (!reading) {
      return res.status(404).json({
        message: "No soil reading found for this farmer",
      });
    }

    res.status(200).json(reading);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getHistoryByFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    // Find all readings, sorted by newest first
    const readings = await SoilReading.find({ farmerId })
      .sort({ recordedAt: -1 });

    res.status(200).json(readings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
