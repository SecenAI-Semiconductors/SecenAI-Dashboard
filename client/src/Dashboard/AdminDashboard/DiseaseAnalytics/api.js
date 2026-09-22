/**
 * api.js — Disease & Pest Analytics API client
 *
 * Same apiFetch pattern as DroneOperations/api.js.
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

const PREFIX = "/api/admin/disease-analytics";

/** GET /overview → { activeCases, totalAffectedAcreage, avgHealthScore, totalEstEconomicLoss } */
export function getOverview() {
  return apiFetch(`${PREFIX}/overview`);
}

/** GET /outbreaks → [{ disease, fieldCount, avgSpreadRatePct, trend, firstDetected, ... }] */
export function getOutbreaks() {
  return apiFetch(`${PREFIX}/outbreaks`);
}

/** GET /heatmap → [{ lat, lng, healthScore, severity, fieldId, ... }] */
export function getHeatmap() {
  return apiFetch(`${PREFIX}/heatmap`);
}

/** GET /treatment-effectiveness → [{ product, avgHealthScoreDelta, avgCost, avgRecoveryDays }] */
export function getTreatmentEffectiveness() {
  return apiFetch(`${PREFIX}/treatment-effectiveness`);
}

/** GET /cases → { cases, total, page, limit, totalPages } */
export function getCases({ page = 1, limit = 10, crop, severity, region, startDate, endDate } = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);
  if (crop) params.set("crop", crop);
  if (severity) params.set("severity", severity);
  if (region) params.set("region", region);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  return apiFetch(`${PREFIX}/cases?${params.toString()}`);
}

/** GET /cases/:id → full detection record */
export function getCaseById(detectionId) {
  return apiFetch(`${PREFIX}/cases/${detectionId}`);
}
