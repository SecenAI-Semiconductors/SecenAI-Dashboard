/**
 * api.js — Drone Operations API client
 *
 * Uses the shared Axios instance from services/api.js so the JWT token
 * is auto-attached to every request (required now that all drone routes
 * are JWT + admin protected).
 */

import api from '../../../services/api';

// ── Drones ────────────────────────────────────────────────────────────────────

export async function getDrones() {
  const res = await api.get('/api/drones');
  return res.data;
}

export async function updateDrone(droneId, patch) {
  const res = await api.patch(`/api/drones/${droneId}`, patch);
  return res.data;
}

// ── Reference Data ─────────────────────────────────────────────────────────────

export async function getOperators() {
  const res = await api.get('/api/operators');
  return res.data;
}

export async function getFields() {
  const res = await api.get('/api/fields');
  return res.data;
}

// ── Farmer lookup (for FlightScheduling UI) ────────────────────────────────────

/** Returns all farmers as [{ _id, fullName, phone, village, district, state }] */
export async function getFarmers() {
  const res = await api.get('/api/admin/drone/farmers');
  return res.data;
}

/**
 * Returns one farmer's profile for auto-filling field/location:
 * { _id, fullName, phone, village, district, state, totalLandArea, crops[] }
 */
export async function getFarmerById(farmerId) {
  const res = await api.get(`/api/admin/drone/farmer/${farmerId}`);
  return res.data;
}

// ── Flights ───────────────────────────────────────────────────────────────────

export async function getFlights() {
  const res = await api.get('/api/flights');
  return res.data;
}

/**
 * Schedule a new flight.  Returns { readiness, flight }.
 * @param {{ droneId, operatorId, fieldId, missionType, date, time, farmerId? }} payload
 */
export async function scheduleFlight(payload) {
  const res = await api.post('/api/flights', payload);
  return res.data;
}

// ── Missions ──────────────────────────────────────────────────────────────────

export async function getMissions({ search = '', status = 'All', type = 'All' } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status && status !== 'All') params.set('status', status);
  if (type   && type   !== 'All') params.set('type', type);
  const qs = params.toString();
  const res = await api.get(`/api/missions${qs ? `?${qs}` : ''}`);
  return res.data;
}

export async function getMissionById(missionId) {
  const res = await api.get(`/api/missions/${missionId}`);
  return res.data;
}

// ── Static reference lists ─────────────────────────────────────────────────────
export const MISSION_TYPES = [
  'Pest & Disease Detection',
  'Crop Health Survey',
  'Irrigation Mapping',
  'Soil Analysis Scan',
  'Yield Estimation',
  'Field Boundary Mapping',
];
