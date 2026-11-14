/**
 * api.js — Crop & Yield Analytics data layer (REAL DATA)
 *
 * All data comes from /api/admin/analytics/crop-yield — computed from
 * the actual farmers' crops[] and totalLandArea fields in the database.
 * No mock data, no random generation.
 */

import api from '../../../services/api'

const CROP_ALIASES = {
  rice: 'Rice (Paddy)',
  paddy: 'Rice (Paddy)',
  'rice (paddy)': 'Rice (Paddy)',
  redgram: 'Redgram (Tur)',
  tur: 'Redgram (Tur)',
  'redgram (tur)': 'Redgram (Tur)',
}

function normalizeCropName(name) {
  const trimmed = name?.trim()
  if (!trimmed) return 'Unknown Crop Field'
  return CROP_ALIASES[trimmed.toLowerCase()] || trimmed
}

// ── Internal cache (loaded once per navigation to the page) ───────────────

let _cache = null
let _initPromise = null

async function fetchAnalytics() {
  const res = await api.get('/api/admin/analytics/crop-yield')
  return res.data
}

/**
 * Builds a flat "record" array compatible with the existing tab components.
 * Each entry = one (farmer × crop) pair.
 * Fields that require yield-measurement data we don't have are null → displayed as —.
 */
function buildRecords(analytics) {
  const records = []
  let idx = 0
  for (const farmer of (analytics.farmerList || [])) {
    if (!farmer.crops?.length) continue
    for (const crop of farmer.crops) {
      records.push({
        _id:          `r-${farmer._id}-${idx++}`,
        farmerId:     String(farmer._id),
        farmerName:   farmer.fullName || '—',
        plotName:     `${farmer.village || farmer.district || 'Field'} Plot`,
        district:     farmer.district || 'Unknown',
        state:        farmer.state || 'Unknown',
        crop:         normalizeCropName(crop.name),
        area:         crop.area || 0,
        // Yield data not available in DB — honest null
        expectedYield: null,
        actualYield:   null,
        forecastYield: null,
        yieldPerAcre:  null,
        production:    0,
        variancePct:   null,
        growthPct:     null,
        regionalBenchmark: null,
        // Stage / season — not stored
        stage:         'pending',
        status:        'Pending',
        isProjected:   false,
        season:        null,
        seasonId:      null,
        sowingDate:    '—',
        harvestDate:   '—',
        actualHarvestDate: null,
      })
    }
  }
  return records
}

async function init() {
  if (_initPromise) return _initPromise
  _initPromise = (async () => {
    const analytics = await fetchAnalytics()
    _cache = {
      analytics,
      records: buildRecords(analytics),
    }
  })()
  return _initPromise
}

/** Call on page mount to always fetch fresh data (farmer profiles may have changed). */
export function resetCache() {
  _cache = null
  _initPromise = null
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC — async loaders
// ═══════════════════════════════════════════════════════════════════════════

export async function getFarmers() {
  await init()
  const farmers = (_cache.analytics.farmerList || []).map(f => ({
    _id: f._id,
    fullName: f.fullName,
    district: f.district,
    state: f.state,
    totalLandArea: f.totalLandArea,
    crops: f.crops,
    role: 'farmer',
    incomplete: f.incomplete,
  }))
  return { farmers, source: 'api' }
}

/** Returns the raw analytics object (for the overview tab). */
export async function getAnalytics() {
  await init()
  return _cache.analytics
}

/** Returns ALL records (unfiltered). Compatible with existing tab component props. */
export async function getYieldData() {
  await init()
  return _cache.records
}

// ═══════════════════════════════════════════════════════════════════════════
// PURE FUNCTIONS — same signatures as before
// ═══════════════════════════════════════════════════════════════════════════

export function applyFilters(data, { season, crop, district, farmerId } = {}) {
  let r = data
  if (crop)     r = r.filter(d => d.crop === crop)
  if (district) r = r.filter(d => d.district === district)
  if (farmerId) r = r.filter(d => d.farmerId === farmerId)
  // season filter: not applicable (no season data) — skip
  return r
}

export function getFilterOptions(allData, { farmerId, season, crop, district } = {}) {
  // Farmer list is ALWAYS built from ALL records ignoring district + crop filters.
  // This prevents the selected farmer from vanishing from the dropdown when their
  // district is auto-set, making it impossible to pick a second farmer.
  const farmerMap = new Map()
  const cropSet = new Set()
  const districtSet = new Set()

  for (const r of allData) {
    const matchCrop     = !crop     || r.crop === crop
    const matchDistrict = !district || r.district === district
    const matchFarmer   = !farmerId || r.farmerId === farmerId

    // Farmers: show ALL farmers regardless of current crop/district filter
    if (!farmerMap.has(r.farmerId)) {
      farmerMap.set(r.farmerId, r.farmerName)
    }
    if (matchFarmer && matchDistrict) cropSet.add(r.crop)
    if (matchFarmer && matchCrop) districtSet.add(r.district)
  }

  return {
    farmers:   [...farmerMap].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
    seasons:   [],   // no season data
    crops:     [...cropSet].sort(),
    districts: [...districtSet].sort(),
  }
}

/** Yield growth not computable without historical measurements. */
export function computeYieldGrowth(_allData, _filterSeason) {
  return null
}

/** Crop performance from real area data; yield metrics are null. */
export function computeCropPerformance(filtered) {
  const byCrop = {}
  for (const r of filtered) {
    if (!byCrop[r.crop]) {
      byCrop[r.crop] = { crop: r.crop, area: 0 }
    }
    byCrop[r.crop].area += r.area
  }
  return Object.values(byCrop).map(g => ({
    crop:            g.crop,
    area:            +g.area.toFixed(1),
    expectedYield:   null,
    actualYield:     null,
    yieldPerAcre:    null,
    prevSeasonYield: null,
    growthPct:       null,
    variancePct:     null,
    benchmark:       null,
    status:          'Pending',
    totalProduction: 0,
    recordCount:     0,
  }))
}

/** No seasonal trend data available. */
export function computeSeasonalTrend(_allData, _cropFilter) {
  return []
}

export function reconcileCheck(_filtered) {
  // no-op: reconciliation only meaningful for generated data
}

// Re-export stubs for components that import these constants
export const CROPS   = []
export const SEASONS = []
export const REGIONAL_BENCHMARKS = {}
