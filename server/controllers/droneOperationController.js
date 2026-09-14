const DroneOperation = require("../models/DroneOperation");

// ════════════════════════════════════════════════════════════════════
//  HELPER — Pre-flight readiness check
//  Takes a drone doc (plain object) and returns a readiness object
//  in the same shape as the frontend's ScheduleFlightModal expects.
// ════════════════════════════════════════════════════════════════════
function buildPreflightCheck(drone) {
  const pct = drone.battery ?? 0;
  const batteryStatus = pct < 20 ? "fail" : pct < 50 ? "warn" : "pass";

  const gpsStatus =
    drone.gpsSignal === "None"
      ? "fail"
      : drone.gpsSignal === "Weak"
      ? "warn"
      : "pass";
  const gpsDetail =
    drone.gpsSignal === "Good"
      ? "Strong (12 satellites)"
      : drone.gpsSignal === "Weak"
      ? "Weak signal (4 satellites)"
      : "No GPS signal";

  const connectivityStatus = drone.connectivity === "Online" ? "pass" : "fail";
  const connectivityDetail =
    drone.connectivity === "Online" ? "4G LTE Active" : "No signal";

  const droneStatusStatus = drone.status === "Available" ? "pass" : "fail";

  return {
    battery:      { label: "Battery",      status: batteryStatus,      detail: `${pct}%` },
    gps:          { label: "GPS Signal",   status: gpsStatus,          detail: gpsDetail },
    connectivity: { label: "Connectivity", status: connectivityStatus, detail: connectivityDetail },
    droneStatus:  { label: "Drone Status", status: droneStatusStatus,  detail: drone.status },
  };
}

/** Map a drone doc → frontend shape */
function formatDrone(d) {
  return {
    id:           d.droneId,
    model:        d.model,
    status:       d.status,
    battery:      d.battery,
    gpsSignal:    d.gpsSignal,
    connectivity: d.connectivity,
    mission:      d.assignedMission || null,
    lastActivity: d.lastActivity,
  };
}

/** Map a flight doc → frontend shape */
function formatFlight(f) {
  return {
    id:           f.flightId,
    droneId:      f.droneId,
    droneModel:   f.droneModel,
    fieldId:      f.fieldId,
    fieldName:    f.fieldName,
    missionType:  f.missionType,
    operatorId:   f.operatorId,
    operatorName: f.operatorName,
    scheduledAt:  f.scheduledAt,
    status:       f.status,
  };
}

/** Map a missionLog doc → frontend shape */
function formatMission(m) {
  return {
    id:           m.missionId,
    date:         m.date,
    droneId:      m.droneId,
    droneModel:   m.droneModel,
    operatorId:   m.operatorId,
    operatorName: m.operatorName,
    fieldName:    m.fieldName,
    missionType:  m.missionType,
    duration:     m.duration,
    status:       m.status,
    coverage:     m.coverage,
    summary:      m.summary,
    alerts:       m.alerts || [],
  };
}

// ════════════════════════════════════════════════════════════════════
//  DRONES   —   GET /api/drones    PATCH /api/drones/:id
// ════════════════════════════════════════════════════════════════════

exports.getDrones = async (req, res) => {
  try {
    const docs = await DroneOperation.find({ docType: "drone" })
      .sort({ status: 1, droneId: 1 })
      .lean();
    res.status(200).json(docs.map(formatDrone));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateDrone = async (req, res) => {
  try {
    const { status, battery, gpsSignal, connectivity, assignedMission } = req.body;
    const update = { lastActivity: new Date() };
    if (status          !== undefined) update.status          = status;
    if (battery         !== undefined) update.battery         = battery;
    if (gpsSignal       !== undefined) update.gpsSignal       = gpsSignal;
    if (connectivity    !== undefined) update.connectivity    = connectivity;
    if (assignedMission !== undefined) update.assignedMission = assignedMission;

    const drone = await DroneOperation.findOneAndUpdate(
      { docType: "drone", droneId: req.params.id },
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!drone) {
      return res.status(404).json({ message: `Drone ${req.params.id} not found.` });
    }
    res.status(200).json(formatDrone(drone));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════════════
//  OPERATORS   —   GET /api/operators
// ════════════════════════════════════════════════════════════════════

exports.getOperators = async (req, res) => {
  try {
    const docs = await DroneOperation.find({ docType: "operator" })
      .sort({ operatorName: 1 })
      .lean();
    res.status(200).json(
      docs.map((o) => ({ id: o.operatorId, name: o.operatorName, zone: o.zone }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════════════
//  FIELDS   —   GET /api/fields
// ════════════════════════════════════════════════════════════════════

exports.getFields = async (req, res) => {
  try {
    const docs = await DroneOperation.find({ docType: "field" })
      .sort({ fieldName: 1 })
      .lean();
    res.status(200).json(
      docs.map((f) => ({
        id:       f.fieldId,
        name:     f.fieldName,
        district: f.district,
        state:    f.state,
        area:     f.area,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════════════
//  FLIGHTS   —   GET /api/flights    POST /api/flights
// ════════════════════════════════════════════════════════════════════

exports.getFlights = async (req, res) => {
  try {
    const docs = await DroneOperation.find({
      docType: "flight",
      status: { $in: ["Scheduled", "In Progress"] },
    })
      .sort({ scheduledAt: 1 })
      .lean();
    res.status(200).json(docs.map(formatFlight));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createFlight = async (req, res) => {
  try {
    const { droneId, operatorId, fieldId, missionType, date, time } = req.body;
    if (!droneId || !operatorId || !fieldId || !missionType || !date || !time) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Load referenced records from the same collection
    const [droneDoc, operatorDoc, fieldDoc] = await Promise.all([
      DroneOperation.findOne({ docType: "drone",    droneId    }).lean(),
      DroneOperation.findOne({ docType: "operator", operatorId }).lean(),
      DroneOperation.findOne({ docType: "field",    fieldId    }).lean(),
    ]);

    if (!droneDoc)    return res.status(404).json({ message: `Drone ${droneId} not found.` });
    if (!operatorDoc) return res.status(404).json({ message: `Operator ${operatorId} not found.` });
    if (!fieldDoc)    return res.status(404).json({ message: `Field ${fieldId} not found.` });

    // Server-side pre-flight readiness check (uses real DB values)
    const readiness = buildPreflightCheck(droneDoc);

    // Generate human-readable flight ID
    const count     = await DroneOperation.countDocuments({ docType: "flight" });
    const flightId  = `SCH-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;
    const scheduledAt = new Date(`${date}T${time}:00`);

    const flight = await DroneOperation.create({
      docType:      "flight",
      flightId,
      droneId:      droneDoc.droneId,
      droneModel:   droneDoc.model,
      operatorId:   operatorDoc.operatorId,
      operatorName: operatorDoc.operatorName,
      fieldId:      fieldDoc.fieldId,
      fieldName:    fieldDoc.fieldName,
      missionType,
      scheduledAt,
      status:       "Scheduled",
    });

    res.status(201).json({ readiness, flight: formatFlight(flight) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════════════
//  MISSIONS   —   GET /api/missions    GET /api/missions/:id
// ════════════════════════════════════════════════════════════════════

exports.getMissions = async (req, res) => {
  try {
    const { search, status, type } = req.query;
    const filter = { docType: "missionLog" };

    if (status && status !== "All") filter.status      = status;
    if (type   && type   !== "All") filter.missionType = type;
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { missionId:    regex },
        { droneId:      regex },
        { operatorName: regex },
        { fieldName:    regex },
        { missionType:  regex },
      ];
    }

    const docs = await DroneOperation.find(filter).sort({ date: -1 }).lean();
    res.status(200).json(docs.map(formatMission));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMissionById = async (req, res) => {
  try {
    const doc = await DroneOperation.findOne({
      docType:   "missionLog",
      missionId: req.params.id,
    }).lean();

    if (!doc) {
      return res.status(404).json({ message: `Mission ${req.params.id} not found.` });
    }
    res.status(200).json(formatMission(doc));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
