/**
 * api.js — Drone Operations API client
 *
 * Thin fetch wrappers that call the Express backend.
 * All functions return data in the same shape the components previously
 * got from mockData.js, so the components themselves need minimal changes.
 *
 * Base URL and API key are read from Vite env vars:
 *   VITE_API_BASE_URL       e.g. "http://localhost:5000"
 *   VITE_API_SECRET_KEY     optional — only enforced in production
 */

const BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");

const HEADERS = {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_API_SECRET_KEY || "",
};

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...HEADERS, ...(options.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API error ${res.status}`);
  }
  return res.json();
}

// ── Drones ────────────────────────────────────────────────────────────────────

/**
 * GET /api/drones
 * Returns [{ id, model, status, battery, gpsSignal, connectivity, mission, lastActivity }]
 */
export function getDrones() {
  return apiFetch("/api/drones");
}

/**
 * PATCH /api/drones/:id
 * Update a drone's status, battery, etc.
 */
export function updateDrone(droneId, patch) {
  return apiFetch(`/api/drones/${droneId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

// ── Reference Data ─────────────────────────────────────────────────────────────

/**
 * GET /api/operators
 * Returns [{ id, name, zone }]
 */
export function getOperators() {
  return apiFetch("/api/operators");
}

/**
 * GET /api/fields
 * Returns [{ id, name, district, state, area }]
 */
export function getFields() {
  return apiFetch("/api/fields");
}

// ── Flights ───────────────────────────────────────────────────────────────────

/**
 * GET /api/flights
 * Returns upcoming scheduled flights:
 * [{ id, droneId, droneModel, fieldId, fieldName, missionType, operatorId, operatorName, scheduledAt, status }]
 */
export function getFlights() {
  return apiFetch("/api/flights");
}

/**
 * POST /api/flights
 * Schedule a new flight.  Returns { readiness, flight }.
 * - readiness: { battery, gps, connectivity, droneStatus } — pre-flight check from server
 * - flight:    the created ScheduledFlight in frontend shape
 *
 * @param {{ droneId, operatorId, fieldId, missionType, date, time }} payload
 */
export function scheduleFlight(payload) {
  return apiFetch("/api/flights", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Missions ──────────────────────────────────────────────────────────────────

/**
 * GET /api/missions
 * Supports optional query filters: search, status, type.
 * Returns [{ id, date, droneId, droneModel, operatorId, operatorName,
 *             fieldName, missionType, duration, status, coverage, summary, alerts }]
 */
export function getMissions({ search = "", status = "All", type = "All" } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status && status !== "All") params.set("status", status);
  if (type   && type   !== "All") params.set("type", type);
  const qs = params.toString();
  return apiFetch(`/api/missions${qs ? `?${qs}` : ""}`);
}

/**
 * GET /api/missions/:id
 * Returns a single mission by its missionId string (e.g. "MSN-2024-018").
 */
export function getMissionById(missionId) {
  return apiFetch(`/api/missions/${missionId}`);
}

// ── Static reference lists (kept for MISSION_TYPES which has no API) ──────────
export const MISSION_TYPES = [
  "Pest & Disease Detection",
  "Crop Health Survey",
  "Irrigation Mapping",
  "Soil Analysis Scan",
  "Yield Estimation",
  "Field Boundary Mapping",
];
