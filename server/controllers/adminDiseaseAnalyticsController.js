const DroneOperation = require("../models/DroneOperation");

// ════════════════════════════════════════════════════════════════════
//  Disease & Pest Analytics — Admin Controller
//  All endpoints read-only aggregate from docType: "detection"
// ════════════════════════════════════════════════════════════════════

const DETECTION_MATCH = { docType: "detection" };

// ── GET /overview ──────────────────────────────────────────────────
// Returns: { activeCases, totalAffectedAcreage, avgHealthScore, totalEstEconomicLoss }
exports.getOverview = async (req, res) => {
  try {
    const [result] = await DroneOperation.aggregate([
      { $match: DETECTION_MATCH },
      {
        $group: {
          _id: null,
          activeCases: { $sum: 1 },
          totalAffectedAcreage: { $sum: "$affectedAcreage" },
          avgHealthScore: { $avg: "$healthScore" },
          totalEstEconomicLoss: { $sum: "$estimatedLoss" },
        },
      },
      {
        $project: {
          _id: 0,
          activeCases: 1,
          totalAffectedAcreage: { $round: ["$totalAffectedAcreage", 1] },
          avgHealthScore: { $round: ["$avgHealthScore", 1] },
          totalEstEconomicLoss: 1,
        },
      },
    ]);

    res.status(200).json(
      result || {
        activeCases: 0,
        totalAffectedAcreage: 0,
        avgHealthScore: 0,
        totalEstEconomicLoss: 0,
      }
    );
  } catch (err) {
    console.error("Disease analytics /overview error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET /outbreaks ─────────────────────────────────────────────────
// Groups by disease.name: fieldCount, avgSpreadRatePct, trend, firstDetectedRange
exports.getOutbreaks = async (req, res) => {
  try {
    const results = await DroneOperation.aggregate([
      { $match: DETECTION_MATCH },
      {
        $group: {
          _id: "$disease.name",
          fieldCount: { $sum: 1 },
          avgSpreadRatePct: { $avg: "$disease.spreadRatePct" },
          avgHealthScore: { $avg: "$healthScore" },
          totalAffectedAcreage: { $sum: "$affectedAcreage" },
          firstDetected: { $min: "$scanDate" },
          lastDetected: { $max: "$scanDate" },
          severities: { $push: "$severity" },
        },
      },
      {
        $project: {
          _id: 0,
          disease: "$_id",
          fieldCount: 1,
          avgSpreadRatePct: { $round: ["$avgSpreadRatePct", 1] },
          avgHealthScore: { $round: ["$avgHealthScore", 0] },
          totalAffectedAcreage: { $round: ["$totalAffectedAcreage", 1] },
          firstDetected: 1,
          lastDetected: 1,
          // Determine trend based on avg spread rate
          trend: {
            $cond: [
              { $gte: ["$avgSpreadRatePct", 10] },
              "up",
              { $cond: [{ $gte: ["$avgSpreadRatePct", 5] }, "stable", "down"] },
            ],
          },
        },
      },
      { $sort: { fieldCount: -1 } },
    ]);

    res.status(200).json(results);
  } catch (err) {
    console.error("Disease analytics /outbreaks error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET /heatmap ───────────────────────────────────────────────────
// Returns: [{ lat, lng, healthScore, severity, fieldId }]
exports.getHeatmap = async (req, res) => {
  try {
    const results = await DroneOperation.aggregate([
      { $match: DETECTION_MATCH },
      {
        $project: {
          _id: 0,
          lat: "$latitude",
          lng: "$longitude",
          healthScore: 1,
          severity: 1,
          fieldId: 1,
          fieldName: 1,
          crop: 1,
          disease: "$disease.name",
        },
      },
    ]);

    res.status(200).json(results);
  } catch (err) {
    console.error("Disease analytics /heatmap error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET /treatment-effectiveness ───────────────────────────────────
// Groups by treatment.product: avgHealthScoreDelta, avgCost, avgRecoveryDays
exports.getTreatmentEffectiveness = async (req, res) => {
  try {
    const results = await DroneOperation.aggregate([
      { $match: { ...DETECTION_MATCH, treatment: { $ne: null } } },
      {
        $group: {
          _id: "$treatment.product",
          casesApplied: { $sum: 1 },
          avgHealthScoreDelta: {
            $avg: {
              $subtract: [
                "$treatment.postHealthScore",
                "$treatment.preHealthScore",
              ],
            },
          },
          avgCost: { $avg: "$treatment.cost" },
          avgRecoveryDays: { $avg: "$treatment.recoveryDays" },
        },
      },
      {
        $project: {
          _id: 0,
          product: "$_id",
          casesApplied: 1,
          avgHealthScoreDelta: { $round: ["$avgHealthScoreDelta", 1] },
          avgCost: { $round: ["$avgCost", 0] },
          avgRecoveryDays: { $round: ["$avgRecoveryDays", 1] },
        },
      },
      { $sort: { avgHealthScoreDelta: -1 } },
    ]);

    res.status(200).json(results);
  } catch (err) {
    console.error("Disease analytics /treatment-effectiveness error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET /cases ─────────────────────────────────────────────────────
// Paginated, filterable: crop, severity, region, dateRange
// Sorted by scanDate desc
exports.getCases = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      crop,
      severity,
      region,
      startDate,
      endDate,
    } = req.query;

    const match = { ...DETECTION_MATCH };

    if (crop) match.crop = crop;
    if (severity) match.severity = severity;
    if (region) match.region = { $regex: region, $options: "i" };
    if (startDate || endDate) {
      match.scanDate = {};
      if (startDate) match.scanDate.$gte = new Date(startDate);
      if (endDate) match.scanDate.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [cases, countResult] = await Promise.all([
      DroneOperation.aggregate([
        { $match: match },
        { $sort: { scanDate: -1 } },
        { $skip: skip },
        { $limit: Number(limit) },
        {
          $project: {
            _id: 0,
            detectionId: 1,
            fieldId: 1,
            fieldName: 1,
            crop: 1,
            disease: "$disease.name",
            severity: 1,
            healthScore: 1,
            scanDate: 1,
            region: 1,
            affectedAcreage: 1,
            estimatedLoss: 1,
          },
        },
      ]),
      DroneOperation.aggregate([
        { $match: match },
        { $count: "total" },
      ]),
    ]);

    const total = countResult[0]?.total || 0;

    res.status(200).json({
      cases,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("Disease analytics /cases error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET /cases/:id ─────────────────────────────────────────────────
// Returns full single detection record
exports.getCaseById = async (req, res) => {
  try {
    const doc = await DroneOperation.findOne({
      ...DETECTION_MATCH,
      detectionId: req.params.id,
    }).lean();

    if (!doc) {
      return res
        .status(404)
        .json({ message: `Detection ${req.params.id} not found.` });
    }

    // Strip mongoose internal fields
    const { _id, __v, docType, ...caseData } = doc;
    res.status(200).json(caseData);
  } catch (err) {
    console.error("Disease analytics /cases/:id error:", err);
    res.status(500).json({ message: err.message });
  }
};
