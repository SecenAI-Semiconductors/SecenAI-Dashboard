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
      enum: ["drone", "operator", "field", "flight", "missionLog"],
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

module.exports = mongoose.model("DroneOperation", droneOperationSchema);
