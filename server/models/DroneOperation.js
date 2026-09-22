const mongoose = require("mongoose");

/**
 * DroneOperation — single schema, single collection ("droneoperations")
 * that stores every drone-ops record type, distinguished by `docType`.
 *
 * docType values:
 *   'drone'      — fleet unit
 *   'operator'   — drone operator
 *   'field'      — agricultural field/location
 *   'flight'     — scheduled flight
 *   'missionLog' — completed/active mission record
 *   'detection'  — pest/disease detection scan result
 *
 * All type-specific fields are optional at the schema level so any
 * docType can be created without validation errors on fields that
 * belong to other types.  The controller functions enforce required
 * fields for each docType before calling .create().
 */
const droneOperationSchema = new mongoose.Schema(
  {
    // ── Discriminator ──────────────────────────────────────────────
    docType: {
      type: String,
      required: true,
      enum: ["drone", "operator", "field", "flight", "missionLog", "detection"],
      index: true,
    },

    // ── drone fields ───────────────────────────────────────────────
    droneId:        { type: String, sparse: true },   // e.g. "DRN-001"
    model:          { type: String },
    status: {
      type: String,
      enum: ["Available", "Scheduled", "Flying", "Charging",
             "Maintenance", "Offline",
             // flight/mission statuses also stored here
             "In Progress", "Completed", "Aborted",
             null],
      default: null,
    },
    battery:        { type: Number, min: 0, max: 100, default: null },
    gpsSignal:      { type: String, enum: ["Good", "Weak", "None", null], default: null },
    connectivity:   { type: String, enum: ["Online", "Offline", null], default: null },
    assignedMission:{ type: String, default: null },  // mission ID string
    lastActivity:   { type: Date,   default: null },

    // ── operator fields ────────────────────────────────────────────
    operatorId:     { type: String, sparse: true },   // e.g. "OPR-01"
    operatorName:   { type: String },                 // renamed from "name" to avoid collision
    zone:           { type: String },
    contact:        { type: String },

    // ── field fields ───────────────────────────────────────────────
    fieldId:        { type: String, sparse: true },   // e.g. "FLD-01"
    fieldName:      { type: String },                 // renamed from "name" to avoid collision
    district:       { type: String },
    state:          { type: String },
    area:           { type: String },

    // ── flight fields ──────────────────────────────────────────────
    flightId:       { type: String, sparse: true },   // e.g. "SCH-2024-001"
    // droneId, droneModel, operatorId, operatorName, fieldId, fieldName — shared above
    droneModel:     { type: String },
    missionType:    { type: String },
    scheduledAt:    { type: Date,   default: null },

    // ── missionLog fields ──────────────────────────────────────────
    missionId:      { type: String, sparse: true },   // e.g. "MSN-2024-018"
    date:           { type: Date,   default: null },
    // droneId, droneModel, operatorId, operatorName, fieldName, missionType — shared above
    duration:       { type: String, default: "—" },
    coverage:       { type: String, default: "—" },
    summary:        { type: String, default: "" },
    alerts: [
      {
        level:   { type: String, enum: ["error", "warning", "info"] },
        message: { type: String },
      },
    ],

    // ── detection fields (pest/disease scan results) ───────────────
    detectionId:      { type: String, sparse: true },   // e.g. "DET-001"
    scanDate:         { type: Date,   default: null },
    crop:             { type: String },                  // e.g. "Corn", "Rice"
    region:           { type: String },                  // e.g. "North Karnataka"
    latitude:         { type: Number },
    longitude:        { type: Number },
    healthScore:      { type: Number },                  // 0–100
    severity:         { type: String },                  // Critical/High/Moderate/Low
    affectedAcreage:  { type: Number },
    estimatedLoss:    { type: Number },                  // in ₹

    // Sub-objects stored as Mixed for flexibility
    disease:          { type: mongoose.Schema.Types.Mixed },   // { name, scientificName, confidence, spreadRatePct, firstDetected }
    treatment:        { type: mongoose.Schema.Types.Mixed },   // { product, preHealthScore, postHealthScore, cost, recoveryDays, appliedDate }

    // Full analysis detail (for admin case detail drawer)
    scanInfo:              { type: mongoose.Schema.Types.Mixed },
    cropHealth:            { type: mongoose.Schema.Types.Mixed },
    detectedIssue:         { type: mongoose.Schema.Types.Mixed },
    whatIsIt:              { type: mongoose.Schema.Types.Mixed },
    whyDidItHappen:        { type: mongoose.Schema.Types.Mixed },
    symptomsFound:         { type: mongoose.Schema.Types.Mixed },
    impactOnCrop:          { type: mongoose.Schema.Types.Mixed },
    recommendedTreatment:  { type: mongoose.Schema.Types.Mixed },
    preventionTips:        { type: mongoose.Schema.Types.Mixed },
    aiRecommendations:     { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true, collection: "droneoperations" }
);

// ── Compound index for docType-scoped queries ──────────────────────
// Speeds up all controller queries that filter by docType first.
droneOperationSchema.index({ docType: 1, droneId: 1 });
droneOperationSchema.index({ docType: 1, operatorId: 1 });
droneOperationSchema.index({ docType: 1, fieldId: 1 });
droneOperationSchema.index({ docType: 1, flightId: 1 });
droneOperationSchema.index({ docType: 1, missionId: 1 });
droneOperationSchema.index({ docType: 1, status: 1 });
droneOperationSchema.index({ docType: 1, date: -1 });
droneOperationSchema.index({ docType: 1, detectionId: 1 });
droneOperationSchema.index({ docType: 1, scanDate: -1 });

module.exports = mongoose.model("DroneOperation", droneOperationSchema);
