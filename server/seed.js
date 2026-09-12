/**
 * seed.js — Drone Operations seed script (consolidated single-collection version)
 *
 * Inserts all mock records into the `droneoperations` collection via
 * DroneOperation.js, each tagged with the correct docType.
 *
 * Run once:  node seed.js
 * Safe to re-run: uses $setOnInsert so existing records are skipped.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const dns      = require("dns");

// Use Google DNS so MongoDB Atlas SRV lookups work in dev (same as db.js)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const DroneOperation = require("./models/DroneOperation");

// ── Seed data ─────────────────────────────────────────────────────────────────

const DRONES = [
  { docType: "drone", droneId: "DRN-001", model: "AgriX Pro 500", status: "Available",   battery: 92,  gpsSignal: "Good", connectivity: "Online",  assignedMission: null,           lastActivity: new Date("2026-09-10T08:30:00") },
  { docType: "drone", droneId: "DRN-002", model: "AgriX Pro 500", status: "Flying",      battery: 61,  gpsSignal: "Good", connectivity: "Online",  assignedMission: "MSN-2024-018", lastActivity: new Date("2026-09-10T17:10:00") },
  { docType: "drone", droneId: "DRN-003", model: "SkyFarm Lite",  status: "Scheduled",   battery: 88,  gpsSignal: "Good", connectivity: "Online",  assignedMission: "MSN-2024-020", lastActivity: new Date("2026-09-10T07:45:00") },
  { docType: "drone", droneId: "DRN-004", model: "SkyFarm Pro",   status: "Charging",    battery: 34,  gpsSignal: "Good", connectivity: "Online",  assignedMission: null,           lastActivity: new Date("2026-09-10T14:20:00") },
  { docType: "drone", droneId: "DRN-005", model: "AgriX Pro 500", status: "Available",   battery: 100, gpsSignal: "Good", connectivity: "Online",  assignedMission: null,           lastActivity: new Date("2026-09-09T18:00:00") },
  { docType: "drone", droneId: "DRN-006", model: "SkyFarm Lite",  status: "Maintenance", battery: 0,   gpsSignal: "None", connectivity: "Offline", assignedMission: null,           lastActivity: new Date("2026-09-08T09:00:00") },
  { docType: "drone", droneId: "DRN-007", model: "AgriX Nano",    status: "Available",   battery: 78,  gpsSignal: "Good", connectivity: "Online",  assignedMission: null,           lastActivity: new Date("2026-09-10T11:00:00") },
  { docType: "drone", droneId: "DRN-008", model: "SkyFarm Pro",   status: "Offline",     battery: 0,   gpsSignal: "None", connectivity: "Offline", assignedMission: null,           lastActivity: new Date("2026-09-05T16:30:00") },
];

const OPERATORS = [
  { docType: "operator", operatorId: "OPR-01", operatorName: "Ravi Kumar",   zone: "North Karnataka" },
  { docType: "operator", operatorId: "OPR-02", operatorName: "Priya Nair",   zone: "Central Tamil Nadu" },
  { docType: "operator", operatorId: "OPR-03", operatorName: "Suresh Patil", zone: "Vidarbha, Maharashtra" },
  { docType: "operator", operatorId: "OPR-04", operatorName: "Meena Sharma", zone: "Rajasthan West" },
  { docType: "operator", operatorId: "OPR-05", operatorName: "Arjun Reddy",  zone: "Andhra Pradesh Coast" },
];

const FIELDS = [
  { docType: "field", fieldId: "FLD-01", fieldName: "Dharwad Block A",  district: "Dharwad",   state: "Karnataka",      area: "12 ha" },
  { docType: "field", fieldId: "FLD-02", fieldName: "Thanjavur North",  district: "Thanjavur", state: "Tamil Nadu",     area: "8 ha"  },
  { docType: "field", fieldId: "FLD-03", fieldName: "Amravati East",    district: "Amravati",  state: "Maharashtra",    area: "20 ha" },
  { docType: "field", fieldId: "FLD-04", fieldName: "Barmer Sector 3",  district: "Barmer",    state: "Rajasthan",      area: "15 ha" },
  { docType: "field", fieldId: "FLD-05", fieldName: "Guntur West Zone", district: "Guntur",    state: "Andhra Pradesh", area: "10 ha" },
  { docType: "field", fieldId: "FLD-06", fieldName: "Bagalkot Plot B",  district: "Bagalkot",  state: "Karnataka",      area: "6 ha"  },
];

const FLIGHTS = [
  { docType: "flight", flightId: "SCH-2024-001", droneId: "DRN-003", droneModel: "SkyFarm Lite",  operatorId: "OPR-02", operatorName: "Priya Nair",   fieldId: "FLD-02", fieldName: "Thanjavur North", missionType: "Crop Health Survey",        scheduledAt: new Date("2026-09-10T18:30:00"), status: "Scheduled" },
  { docType: "flight", flightId: "SCH-2024-002", droneId: "DRN-001", droneModel: "AgriX Pro 500", operatorId: "OPR-01", operatorName: "Ravi Kumar",   fieldId: "FLD-01", fieldName: "Dharwad Block A",  missionType: "Pest & Disease Detection",  scheduledAt: new Date("2026-09-11T07:00:00"), status: "Scheduled" },
  { docType: "flight", flightId: "SCH-2024-003", droneId: "DRN-005", droneModel: "AgriX Pro 500", operatorId: "OPR-03", operatorName: "Suresh Patil", fieldId: "FLD-03", fieldName: "Amravati East",    missionType: "Irrigation Mapping",        scheduledAt: new Date("2026-09-11T09:30:00"), status: "Scheduled" },
];

const MISSIONS = [
  { docType: "missionLog", missionId: "MSN-2024-018", date: new Date("2026-09-10"), droneId: "DRN-002", droneModel: "AgriX Pro 500", operatorId: "OPR-01", operatorName: "Ravi Kumar",   fieldName: "Dharwad Block A",  missionType: "Pest & Disease Detection", duration: "38 min",    status: "In Progress", coverage: "10.2 ha", summary: "Ongoing mission. Early-stage pest detection underway. Drone at 600m altitude, all systems nominal.",                                                         alerts: [{ level: "warning", message: "Mild aphid infestation detected in northern quadrant." }] },
  { docType: "missionLog", missionId: "MSN-2024-017", date: new Date("2026-09-10"), droneId: "DRN-005", droneModel: "AgriX Pro 500", operatorId: "OPR-02", operatorName: "Priya Nair",   fieldName: "Thanjavur North",  missionType: "Crop Health Survey",       duration: "52 min",    status: "Completed",   coverage: "8 ha",    summary: "Full-field crop health survey completed successfully. NDVI index: 0.72 (Good). No anomalies detected.",                                                        alerts: [] },
  { docType: "missionLog", missionId: "MSN-2024-016", date: new Date("2026-09-09"), droneId: "DRN-001", droneModel: "AgriX Pro 500", operatorId: "OPR-03", operatorName: "Suresh Patil", fieldName: "Amravati East",    missionType: "Irrigation Mapping",       duration: "1h 10 min", status: "Completed",   coverage: "20 ha",   summary: "Irrigation mapping completed. South-east sector shows dry patches; recommend irrigation adjustment.",                                                          alerts: [{ level: "info",    message: "Uneven water distribution found in south-east section." }] },
  { docType: "missionLog", missionId: "MSN-2024-015", date: new Date("2026-09-09"), droneId: "DRN-007", droneModel: "AgriX Nano",    operatorId: "OPR-04", operatorName: "Meena Sharma", fieldName: "Barmer Sector 3",  missionType: "Soil Analysis Scan",       duration: "44 min",    status: "Completed",   coverage: "15 ha",   summary: "Soil analysis scan complete. Nitrogen levels adequate. Phosphorus slightly low in central zone.",                                                              alerts: [] },
  { docType: "missionLog", missionId: "MSN-2024-014", date: new Date("2026-09-08"), droneId: "DRN-003", droneModel: "SkyFarm Lite",  operatorId: "OPR-05", operatorName: "Arjun Reddy",  fieldName: "Guntur West Zone", missionType: "Yield Estimation",          duration: "29 min",    status: "Aborted",     coverage: "3.1 ha",  summary: "Mission aborted after GPS signal loss. Partial coverage data saved. Re-schedule recommended.",                                                                alerts: [{ level: "error", message: "Lost GPS signal mid-mission. Drone returned to home point." }, { level: "warning", message: "Only 31% of field covered before abort." }] },
  { docType: "missionLog", missionId: "MSN-2024-013", date: new Date("2026-09-08"), droneId: "DRN-004", droneModel: "SkyFarm Pro",   operatorId: "OPR-01", operatorName: "Ravi Kumar",   fieldName: "Bagalkot Plot B",  missionType: "Field Boundary Mapping",   duration: "22 min",    status: "Completed",   coverage: "6 ha",    summary: "Boundary mapping completed. KML export ready. Field perimeter updated in system.",                                                                            alerts: [] },
  { docType: "missionLog", missionId: "MSN-2024-012", date: new Date("2026-09-07"), droneId: "DRN-002", droneModel: "AgriX Pro 500", operatorId: "OPR-02", operatorName: "Priya Nair",   fieldName: "Thanjavur North",  missionType: "Pest & Disease Detection", duration: "47 min",    status: "Completed",   coverage: "8 ha",    summary: "Pest detection completed. Leaf blight risk flagged. Recommended follow-up fungicide spray.",                                                                  alerts: [{ level: "warning", message: "Early signs of leaf blight detected in eastern rows." }] },
];

// ── Runner ────────────────────────────────────────────────────────────────────

async function upsert(idField, records) {
  let inserted = 0, skipped = 0;
  for (const rec of records) {
    const result = await DroneOperation.updateOne(
      { [idField]: rec[idField] },
      { $setOnInsert: rec },
      { upsert: true }
    );
    result.upsertedCount > 0 ? inserted++ : skipped++;
  }
  return { inserted, skipped };
}

async function seed() {
  console.log("\n🌱  Drone Operations Seed Script  (single-collection)");
  console.log("─────────────────────────────────────────────────────");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅  Connected to MongoDB\n");

  const r1 = await upsert("droneId",    DRONES);
  const r2 = await upsert("operatorId", OPERATORS);
  const r3 = await upsert("fieldId",    FIELDS);
  const r4 = await upsert("flightId",   FLIGHTS);
  const r5 = await upsert("missionId",  MISSIONS);

  console.log(`Drones    (docType:'drone'):      ${r1.inserted} inserted, ${r1.skipped} already existed`);
  console.log(`Operators (docType:'operator'):   ${r2.inserted} inserted, ${r2.skipped} already existed`);
  console.log(`Fields    (docType:'field'):      ${r3.inserted} inserted, ${r3.skipped} already existed`);
  console.log(`Flights   (docType:'flight'):     ${r4.inserted} inserted, ${r4.skipped} already existed`);
  console.log(`Missions  (docType:'missionLog'): ${r5.inserted} inserted, ${r5.skipped} already existed`);

  const total = await DroneOperation.countDocuments();
  console.log(`\n📦  Total docs in 'droneoperations': ${total}`);
  console.log("✅  Seed complete!\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
