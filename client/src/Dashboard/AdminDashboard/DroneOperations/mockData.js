/**
 * mockData.js — Drone Operations Module
 *
 * All data is exported as plain arrays for now.
 * To integrate real APIs, replace these with async fetch functions:
 *
 *   export async function fetchDrones() {
 *     const res = await fetch('/api/drones', { headers: { 'x-api-key': ... } });
 *     return res.json();
 *   }
 */

// ── Drone Fleet ──────────────────────────────────────────────────────────────

export const DRONES = [
  { id: 'DRN-001', model: 'AgriX Pro 500', status: 'Available',   battery: 92, mission: null,             lastActivity: '2026-09-10T08:30:00' },
  { id: 'DRN-002', model: 'AgriX Pro 500', status: 'Flying',      battery: 61, mission: 'MSN-2024-018',   lastActivity: '2026-09-10T17:10:00' },
  { id: 'DRN-003', model: 'SkyFarm Lite',  status: 'Scheduled',   battery: 88, mission: 'MSN-2024-020',   lastActivity: '2026-09-10T07:45:00' },
  { id: 'DRN-004', model: 'SkyFarm Pro',   status: 'Charging',    battery: 34, mission: null,             lastActivity: '2026-09-10T14:20:00' },
  { id: 'DRN-005', model: 'AgriX Pro 500', status: 'Available',   battery: 100, mission: null,            lastActivity: '2026-09-09T18:00:00' },
  { id: 'DRN-006', model: 'SkyFarm Lite',  status: 'Maintenance', battery: 0,  mission: null,             lastActivity: '2026-09-08T09:00:00' },
  { id: 'DRN-007', model: 'AgriX Nano',    status: 'Available',   battery: 78, mission: null,             lastActivity: '2026-09-10T11:00:00' },
  { id: 'DRN-008', model: 'SkyFarm Pro',   status: 'Offline',     battery: 0,  mission: null,             lastActivity: '2026-09-05T16:30:00' },
];

// ── Operators ─────────────────────────────────────────────────────────────────

export const OPERATORS = [
  { id: 'OPR-01', name: 'Ravi Kumar',      zone: 'North Karnataka' },
  { id: 'OPR-02', name: 'Priya Nair',      zone: 'Central Tamil Nadu' },
  { id: 'OPR-03', name: 'Suresh Patil',    zone: 'Vidarbha, Maharashtra' },
  { id: 'OPR-04', name: 'Meena Sharma',    zone: 'Rajasthan West' },
  { id: 'OPR-05', name: 'Arjun Reddy',     zone: 'Andhra Pradesh Coast' },
];

// ── Fields / Locations ────────────────────────────────────────────────────────

export const FIELDS = [
  { id: 'FLD-01', name: 'Dharwad Block A',   district: 'Dharwad',    state: 'Karnataka',    area: '12 ha' },
  { id: 'FLD-02', name: 'Thanjavur North',   district: 'Thanjavur',  state: 'Tamil Nadu',   area: '8 ha'  },
  { id: 'FLD-03', name: 'Amravati East',     district: 'Amravati',   state: 'Maharashtra',  area: '20 ha' },
  { id: 'FLD-04', name: 'Barmer Sector 3',   district: 'Barmer',     state: 'Rajasthan',    area: '15 ha' },
  { id: 'FLD-05', name: 'Guntur West Zone',  district: 'Guntur',     state: 'Andhra Pradesh', area: '10 ha' },
  { id: 'FLD-06', name: 'Bagalkot Plot B',   district: 'Bagalkot',   state: 'Karnataka',    area: '6 ha'  },
];

// ── Mission Types ─────────────────────────────────────────────────────────────

export const MISSION_TYPES = [
  'Pest & Disease Detection',
  'Crop Health Survey',
  'Irrigation Mapping',
  'Soil Analysis Scan',
  'Yield Estimation',
  'Field Boundary Mapping',
];

// ── Scheduled Flights ─────────────────────────────────────────────────────────

export const INITIAL_SCHEDULED_FLIGHTS = [
  {
    id: 'SCH-2024-001',
    droneId: 'DRN-003',
    droneModel: 'SkyFarm Lite',
    fieldId: 'FLD-02',
    fieldName: 'Thanjavur North',
    missionType: 'Crop Health Survey',
    operatorId: 'OPR-02',
    operatorName: 'Priya Nair',
    scheduledAt: '2026-09-10T18:30:00',
    status: 'Scheduled',
  },
  {
    id: 'SCH-2024-002',
    droneId: 'DRN-001',
    droneModel: 'AgriX Pro 500',
    fieldId: 'FLD-01',
    fieldName: 'Dharwad Block A',
    missionType: 'Pest & Disease Detection',
    operatorId: 'OPR-01',
    operatorName: 'Ravi Kumar',
    scheduledAt: '2026-09-11T07:00:00',
    status: 'Scheduled',
  },
  {
    id: 'SCH-2024-003',
    droneId: 'DRN-005',
    droneModel: 'AgriX Pro 500',
    fieldId: 'FLD-03',
    fieldName: 'Amravati East',
    missionType: 'Irrigation Mapping',
    operatorId: 'OPR-03',
    operatorName: 'Suresh Patil',
    scheduledAt: '2026-09-11T09:30:00',
    status: 'Scheduled',
  },
];

// ── Mission Logs ──────────────────────────────────────────────────────────────

export const MISSION_LOGS = [
  {
    id: 'MSN-2024-018',
    date: '2026-09-10',
    droneId: 'DRN-002',
    droneModel: 'AgriX Pro 500',
    operatorId: 'OPR-01',
    operatorName: 'Ravi Kumar',
    fieldName: 'Dharwad Block A',
    missionType: 'Pest & Disease Detection',
    duration: '38 min',
    status: 'In Progress',
    coverage: '10.2 ha',
    alerts: [
      { level: 'warning', message: 'Mild aphid infestation detected in northern quadrant.' },
    ],
    summary: 'Ongoing mission. Early-stage pest detection underway. Drone at 600m altitude, all systems nominal.',
  },
  {
    id: 'MSN-2024-017',
    date: '2026-09-10',
    droneId: 'DRN-005',
    droneModel: 'AgriX Pro 500',
    operatorId: 'OPR-02',
    operatorName: 'Priya Nair',
    fieldName: 'Thanjavur North',
    missionType: 'Crop Health Survey',
    duration: '52 min',
    status: 'Completed',
    coverage: '8 ha',
    alerts: [],
    summary: 'Full-field crop health survey completed successfully. NDVI index: 0.72 (Good). No anomalies detected.',
  },
  {
    id: 'MSN-2024-016',
    date: '2026-09-09',
    droneId: 'DRN-001',
    droneModel: 'AgriX Pro 500',
    operatorId: 'OPR-03',
    operatorName: 'Suresh Patil',
    fieldName: 'Amravati East',
    missionType: 'Irrigation Mapping',
    duration: '1h 10 min',
    status: 'Completed',
    coverage: '20 ha',
    alerts: [
      { level: 'info', message: 'Uneven water distribution found in south-east section.' },
    ],
    summary: 'Irrigation mapping completed. South-east sector shows dry patches; recommend irrigation adjustment.',
  },
  {
    id: 'MSN-2024-015',
    date: '2026-09-09',
    droneId: 'DRN-007',
    droneModel: 'AgriX Nano',
    operatorId: 'OPR-04',
    operatorName: 'Meena Sharma',
    fieldName: 'Barmer Sector 3',
    missionType: 'Soil Analysis Scan',
    duration: '44 min',
    status: 'Completed',
    coverage: '15 ha',
    alerts: [],
    summary: 'Soil analysis scan complete. Nitrogen levels adequate. Phosphorus slightly low in central zone.',
  },
  {
    id: 'MSN-2024-014',
    date: '2026-09-08',
    droneId: 'DRN-003',
    droneModel: 'SkyFarm Lite',
    operatorId: 'OPR-05',
    operatorName: 'Arjun Reddy',
    fieldName: 'Guntur West Zone',
    missionType: 'Yield Estimation',
    duration: '29 min',
    status: 'Aborted',
    coverage: '3.1 ha',
    alerts: [
      { level: 'error', message: 'Lost GPS signal mid-mission. Drone returned to home point.' },
      { level: 'warning', message: 'Only 31% of field covered before abort.' },
    ],
    summary: 'Mission aborted after GPS signal loss. Partial coverage data saved. Re-schedule recommended.',
  },
  {
    id: 'MSN-2024-013',
    date: '2026-09-08',
    droneId: 'DRN-004',
    droneModel: 'SkyFarm Pro',
    operatorId: 'OPR-01',
    operatorName: 'Ravi Kumar',
    fieldName: 'Bagalkot Plot B',
    missionType: 'Field Boundary Mapping',
    duration: '22 min',
    status: 'Completed',
    coverage: '6 ha',
    alerts: [],
    summary: 'Boundary mapping completed. KML export ready. Field perimeter updated in system.',
  },
  {
    id: 'MSN-2024-012',
    date: '2026-09-07',
    droneId: 'DRN-002',
    droneModel: 'AgriX Pro 500',
    operatorId: 'OPR-02',
    operatorName: 'Priya Nair',
    fieldName: 'Thanjavur North',
    missionType: 'Pest & Disease Detection',
    duration: '47 min',
    status: 'Completed',
    coverage: '8 ha',
    alerts: [
      { level: 'warning', message: 'Early signs of leaf blight detected in eastern rows.' },
    ],
    summary: 'Pest detection completed. Leaf blight risk flagged. Recommended follow-up fungicide spray.',
  },
];

// ── Pre-flight check helper ───────────────────────────────────────────────────

/**
 * Returns a pre-flight readiness check for a given drone.
 * In production, replace with a real telemetry API call.
 */
export function getPreflightCheck(drone) {
  if (!drone) return null;

  const batteryOk = drone.battery >= 20;
  const statusOk  = drone.status === 'Available';

  return {
    battery:      { label: 'Battery',      status: batteryOk ? (drone.battery >= 50 ? 'pass' : 'warn') : 'fail', detail: `${drone.battery}%` },
    gps:          { label: 'GPS Signal',   status: statusOk ? 'pass' : 'warn',  detail: statusOk ? 'Strong (12 satellites)' : 'Degraded' },
    connectivity: { label: 'Connectivity', status: statusOk ? 'pass' : 'warn',  detail: statusOk ? '4G LTE Active' : 'No signal' },
    droneStatus:  { label: 'Drone Status', status: statusOk ? 'pass' : 'fail',  detail: drone.status },
  };
}
