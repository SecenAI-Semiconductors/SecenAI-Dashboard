/**
 * api.js – Disease & Pest Analytics API client
 *
 * Uses the shared Axios instance (services/api.js) which automatically
 * attaches the JWT from localStorage as Authorization: Bearer <token>.
 */

import api from '../../../services/api'

const PREFIX = '/api/admin/disease-analytics'

/** GET /overview → { activeCases, totalAffectedAcreage, avgHealthScore, totalEstEconomicLoss } */
export function getOverview() {
  return api.get(`${PREFIX}/overview`).then(r => r.data)
}

/** GET /outbreaks → [{ disease, fieldCount, avgSpreadRatePct, trend, firstDetected, ... }] */
export function getOutbreaks() {
  return api.get(`${PREFIX}/outbreaks`).then(r => r.data)
}

/** GET /heatmap → [{ lat, lng, healthScore, severity, fieldId, ... }] */
export function getHeatmap() {
  return api.get(`${PREFIX}/heatmap`).then(r => r.data)
}

/** GET /treatment-effectiveness → [{ product, avgHealthScoreDelta, avgCost, avgRecoveryDays }] */
export function getTreatmentEffectiveness() {
  return api.get(`${PREFIX}/treatment-effectiveness`).then(r => r.data)
}

/** GET /cases → { cases, total, page, limit, totalPages } */
export function getCases({ page = 1, limit = 10, crop, severity, region, startDate, endDate } = {}) {
  const params = new URLSearchParams()
  params.set('page', page)
  params.set('limit', limit)
  if (crop)      params.set('crop', crop)
  if (severity)  params.set('severity', severity)
  if (region)    params.set('region', region)
  if (startDate) params.set('startDate', startDate)
  if (endDate)   params.set('endDate', endDate)
  return api.get(`${PREFIX}/cases?${params.toString()}`).then(r => r.data)
}

/** GET /cases/:id → full detection record */
export function getCaseById(detectionId) {
  return api.get(`${PREFIX}/cases/${detectionId}`).then(r => r.data)
}
