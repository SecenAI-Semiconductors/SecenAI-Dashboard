/**
 * utils.js — Crop & Yield Analytics Module
 *
 * Shared constants, formatters, and calculators.
 * All date logic uses REFERENCE_DATE instead of Date.now() for reproducibility.
 */

// ── Fixed reference date (Kharif 2026 season) ────────────────────────────
export const REFERENCE_DATE = new Date('2026-10-01T00:00:00+05:30')

// ── Chart color palette ───────────────────────────────────────────────────
// Matches colors already in use across existing dashboard charts
export const CHART_COLORS = {
  green: '#2e9e50',
  greenDark: '#22783c',
  blue: '#2b6cb0',
  gold: '#d69e2e',
  orange: '#e07c3e',
  stone: '#78716c',
  purple: '#7c3aed',
  teal: '#0d9488',
  // Ordered palette for multi-series charts
  series: [
    '#2e9e50', '#2b6cb0', '#d69e2e', '#e07c3e',
    '#7c3aed', '#0d9488', '#78716c', '#22783c',
  ],
  // Status → color mapping
  status: {
    'On Track': '#2e9e50',
    'Watch': '#d69e2e',
    'Underperforming': '#e07c3e',
    'In Progress': '#2b6cb0',
    'Pending': '#8a9a8a',
  },
  // Confidence → color mapping
  confidence: {
    High: '#2e9e50',
    Medium: '#d69e2e',
    Low: '#e07c3e',
  },
  // Grid / axis (same as existing charts)
  grid: 'rgba(34,120,60,0.06)',
  axis: '#8a9a8a',
  axisLine: 'rgba(34,120,60,0.10)',
}

// ── Deterministic hash ────────────────────────────────────────────────────
// Returns a float in [0, 1) from any string key. Consistent across renders.
export function deterministicSeed(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return ((h >>> 0) % 10000) / 10000
}

// Returns a deterministic number in [min, max] for the given key
export function seedRange(key, min, max, decimals = 3) {
  return +(min + deterministicSeed(key) * (max - min)).toFixed(decimals)
}

// ── Number / unit formatters (en-IN locale) ───────────────────────────────

export function formatNumber(n, decimals = 0) {
  if (n == null || isNaN(n)) return '—'
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatArea(acres) {
  if (acres == null) return '—'
  return `${formatNumber(acres, 1)} acres`
}

export function formatProduction(tonnes) {
  if (tonnes == null) return '—'
  return `${formatNumber(tonnes, 2)} t`
}

export function formatYield(tPerAcre) {
  if (tPerAcre == null) return '—'
  return `${formatNumber(tPerAcre, 2)} t/acre`
}

export function formatPercent(pct) {
  if (pct == null || isNaN(pct)) return '—'
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(1)}%`
}

// ── Variance & status calculators ────────────────────────────────────────

export function getVariancePct(actual, expected) {
  if (expected == null || expected === 0 || actual == null) return null
  return +((actual - expected) / expected * 100).toFixed(1)
}

/**
 * Status based on variance of actual vs expected.
 *   >= -5%    → On Track
 *   -5% to -15% → Watch
 *   < -15%   → Underperforming
 */
export function getStatus(variancePct) {
  if (variancePct == null) return 'Pending'
  if (variancePct >= -5) return 'On Track'
  if (variancePct >= -15) return 'Watch'
  return 'Underperforming'
}

/**
 * Forecast confidence.
 *   High   = within 30 days of harvest AND stage >= maturity
 *   Medium = 30–60 days out
 *   Low    = > 60 days out
 */
export function getConfidence(expectedHarvestDate, cropStage, refDate = REFERENCE_DATE) {
  if (!expectedHarvestDate) return 'Low'
  const harvestMs = new Date(expectedHarvestDate).getTime()
  const refMs = refDate.getTime()
  const daysToHarvest = Math.ceil((harvestMs - refMs) / (1000 * 60 * 60 * 24))

  if (daysToHarvest <= 0) return 'High'

  const matureStages = ['maturity', 'harvest-ready']
  if (daysToHarvest <= 30 && matureStages.includes(cropStage)) return 'High'
  if (daysToHarvest <= 60) return 'Medium'
  return 'Low'
}

/**
 * Determine crop growth stage from dates.
 * Divides the growing period into 6 stages based on elapsed progress:
 *   sowing → vegetative → flowering → maturity → harvest-ready → harvested
 */
export function getCropStage(sowingDate, expectedHarvestDate, refDate = REFERENCE_DATE) {
  if (!sowingDate || !expectedHarvestDate) return 'sowing'
  const sowMs = new Date(sowingDate).getTime()
  const harvestMs = new Date(expectedHarvestDate).getTime()
  const refMs = refDate.getTime()

  if (refMs >= harvestMs) return 'harvested'
  if (refMs < sowMs) return 'sowing'

  const totalDays = (harvestMs - sowMs) / (1000 * 60 * 60 * 24)
  const elapsed = (refMs - sowMs) / (1000 * 60 * 60 * 24)
  const progress = elapsed / totalDays

  if (progress < 0.20) return 'sowing'
  if (progress < 0.45) return 'vegetative'
  if (progress < 0.70) return 'flowering'
  if (progress < 0.90) return 'maturity'
  return 'harvest-ready'
}

/**
 * Days between two date strings (positive if b > a).
 */
export function daysBetween(dateA, dateB) {
  return Math.ceil(
    (new Date(dateB).getTime() - new Date(dateA).getTime()) / (1000 * 60 * 60 * 24)
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────

/** Trim + title-case a string ("khammam" → "Khammam"). */
export function titleCase(str) {
  if (!str) return ''
  return str.trim().replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

// ── Single-pass enrichment ────────────────────────────────────────────────

/**
 * Enrich a raw yield record with derived fields.
 * Called once per record in api.js — no component re-derives these.
 *
 * Added / normalised fields:
 *   district (title-cased), yieldPerAcre, production, variancePct, status, isProjected
 */
export function enrichRecord(r) {
  const isHarvested = r.stage === 'harvested'
  const hasForecast = r.forecastYield != null
  const isInProgress = !isHarvested && hasForecast

  // Best-available yield per acre
  const yieldPerAcre = isHarvested
    ? r.actualYield
    : (r.forecastYield ?? r.expectedYield)

  // Production = area × best-available yield
  const production = +(r.area * yieldPerAcre).toFixed(2)

  // Variance: harvested → actual vs expected, in-progress → forecast vs expected
  let variancePct = null
  if (isHarvested && r.actualYield != null) {
    variancePct = getVariancePct(r.actualYield, r.expectedYield)
  } else if (isInProgress) {
    variancePct = getVariancePct(r.forecastYield, r.expectedYield)
  }

  // Status from variance (same thresholds for actual and projected)
  const status = variancePct != null ? getStatus(variancePct) : 'Pending'

  return { ...r, district: titleCase(r.district), yieldPerAcre, production, variancePct, status, isProjected: isInProgress }
}
