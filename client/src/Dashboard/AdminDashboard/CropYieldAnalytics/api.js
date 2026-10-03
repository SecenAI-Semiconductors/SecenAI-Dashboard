/**
 * api.js — Crop & Yield Analytics data layer
 *
 * Single source of truth:
 *   1. Fetches real farmers from the API (same endpoint as Farmer Management).
 *      Falls back to the local list ONLY when the call fails or returns 0.
 *   2. Generates raw records via generateYieldData().
 *   3. Enriches every record ONCE via enrichRecord().
 *
 * UI components import from this file only, never from mockData.js.
 */

import { generateYieldData, FALLBACK_FARMERS, CROPS, SEASONS, REGIONAL_BENCHMARKS } from './mockData'
import { enrichRecord, REFERENCE_DATE } from './utils'

// ── API config ────────────────────────────────────────────────────────────

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '')

const HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': import.meta.env.VITE_API_SECRET_KEY || '',
}

// ── Internal state (loaded once) ──────────────────────────────────────────

let _farmers = null
let _source = null      // 'api' | 'fallback'
let _enrichedData = null
let _initPromise = null

async function fetchAllFarmers() {
  const res = await fetch(`${BASE}/api/users`, { headers: HEADERS })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

async function init() {
  if (_initPromise) return _initPromise
  _initPromise = (async () => {
    try {
      const data = await fetchAllFarmers()
      const raw = Array.isArray(data) ? data : (data.users || data.data || [])
      // Use ALL users from /api/users (same as Farmer Management — no role filter)
      const list = raw.filter(u => u._id)

      // DEBUG: log exactly what comes from the API
      console.info('[CropYieldAnalytics] API raw count:', raw.length, 'filtered (has _id):', list.length)
      for (const u of raw) {
        console.info('  →', { _id: u._id, fullName: u.fullName, role: u.role, totalLandArea: u.totalLandArea, district: u.district })
      }

      if (list.length > 0) {
        _farmers = list
        _source = 'api'
      } else {
        console.warn('[CropYieldAnalytics] 0 farmers from API, using fallback')
        _farmers = FALLBACK_FARMERS
        _source = 'fallback'
      }
    } catch (err) {
      console.error('[CropYieldAnalytics] API error:', err.message)
      _farmers = FALLBACK_FARMERS
      _source = 'fallback'
    }

    // Generate raw records → enrich in one pass
    const rawRecords = generateYieldData(_farmers)
    _enrichedData = rawRecords.map(enrichRecord)
  })()
  return _initPromise
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC — async loaders (call init once)
// ═══════════════════════════════════════════════════════════════════════════

export async function getFarmers() {
  await init()
  return { farmers: _farmers, source: _source }
}

/** Returns ALL enriched records (unfiltered). */
export async function getYieldData() {
  await init()
  return _enrichedData
}

// ═══════════════════════════════════════════════════════════════════════════
// PURE FUNCTIONS — work on enriched data, no side-effects
// ═══════════════════════════════════════════════════════════════════════════

/** Filter enriched records by any combination of filters. */
export function applyFilters(data, { season, crop, district, farmerId } = {}) {
  let r = data
  if (season)   r = r.filter(d => d.season === season || d.seasonId === season)
  if (crop)     r = r.filter(d => d.crop === crop)
  if (district) r = r.filter(d => d.district === district)
  if (farmerId) r = r.filter(d => d.farmerId === farmerId)
  return r
}

/**
 * Compute dependent filter options in one pass.
 * For each dropdown, options = distinct values from records matching ALL OTHER
 * active filters (not itself). This prevents impossible combinations.
 *
 * @param {Array}  allData - ALL enriched records (unfiltered)
 * @param {Object} filters - { farmerId, season, crop, district }
 * @returns {{ farmers: [{id,name}], seasons: string[], crops: string[], districts: string[] }}
 */
export function getFilterOptions(allData, { farmerId, season, crop, district } = {}) {
  const farmerMap = new Map()
  const seasonSet = new Set()
  const cropSet = new Set()
  const districtSet = new Set()

  for (const r of allData) {
    const matchSeason   = !season   || r.season === season
    const matchCrop     = !crop     || r.crop === crop
    const matchDistrict = !district || r.district === district
    const matchFarmer   = !farmerId || r.farmerId === farmerId

    // Farmer options: match season + crop + district (exclude farmer)
    if (matchSeason && matchCrop && matchDistrict && !farmerMap.has(r.farmerId)) {
      farmerMap.set(r.farmerId, r.farmerName)
    }
    // Season options: match farmer + crop + district (exclude season)
    if (matchFarmer && matchCrop && matchDistrict) seasonSet.add(r.season)
    // Crop options: match farmer + season + district (exclude crop)
    if (matchFarmer && matchSeason && matchDistrict) cropSet.add(r.crop)
    // District options: match farmer + season + crop (exclude district)
    if (matchFarmer && matchSeason && matchCrop) districtSet.add(r.district)
  }

  return {
    farmers:   [...farmerMap].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
    seasons:   [...seasonSet].sort(),
    crops:     [...cropSet].sort(),
    districts: [...districtSet].sort(),
  }
}

// ── Season type helper ────────────────────────────────────────────────────

function getSeasonType(seasonId) {
  return seasonId.startsWith('kharif') ? 'kharif' : seasonId.startsWith('rabi') ? 'rabi' : seasonId
}

// ── Yield Growth % ────────────────────────────────────────────────────────
/**
 * Average per-crop yield/acre change vs the previous season of the same type,
 * over crops harvested in both. Returns null if none qualify.
 */
export function computeYieldGrowth(allData, filterSeason) {
  // Determine current season
  let currentId = null
  if (filterSeason) {
    const s = SEASONS.find(s => s.name === filterSeason)
    if (s) currentId = s.id
  }
  if (!currentId) {
    const ip = SEASONS.find(s => s.status === 'in-progress')
    currentId = ip?.id
  }
  if (!currentId) return null

  const currentType = getSeasonType(currentId)
  const prev = [...SEASONS].reverse().find(s => getSeasonType(s.id) === currentType && s.id !== currentId)
  if (!prev) return null

  const curr = allData.filter(r => r.seasonId === currentId && r.stage === 'harvested')
  const prevR = allData.filter(r => r.seasonId === prev.id && r.stage === 'harvested')
  if (!curr.length || !prevR.length) return null

  // Per-crop avg yield/acre
  const avg = (recs) => {
    const m = {}
    for (const r of recs) {
      if (!m[r.crop]) m[r.crop] = { s: 0, n: 0 }
      m[r.crop].s += r.yieldPerAcre
      m[r.crop].n++
    }
    return m
  }
  const ca = avg(curr), pa = avg(prevR)

  let gSum = 0, gCount = 0
  for (const crop of Object.keys(ca)) {
    if (pa[crop] && pa[crop].n > 0) {
      const c = ca[crop].s / ca[crop].n
      const p = pa[crop].s / pa[crop].n
      if (p > 0) { gSum += (c - p) / p * 100; gCount++ }
    }
  }
  return gCount > 0 ? +(gSum / gCount).toFixed(1) : null
}

// ── Crop Performance aggregation ──────────────────────────────────────────

export function computeCropPerformance(filtered, allData, filterSeason) {
  const byCrop = {}
  for (const r of filtered) {
    if (!byCrop[r.crop]) {
      byCrop[r.crop] = { crop: r.crop, area: 0, expProd: 0,
        harvestedArea: 0, harvestedActProd: 0, harvestedYieldSum: 0, harvestedCount: 0,
        benchSum: 0, benchCount: 0, count: 0, totalProd: 0 }
    }
    const g = byCrop[r.crop]
    g.area += r.area
    g.expProd += r.expectedYield * r.area
    g.totalProd += r.production
    g.count++
    if (r.stage === 'harvested') {
      g.harvestedArea += r.area
      g.harvestedActProd += r.actualYield * r.area
      g.harvestedYieldSum += r.yieldPerAcre
      g.harvestedCount++
    }
    if (r.regionalBenchmark != null) { g.benchSum += r.regionalBenchmark; g.benchCount++ }
  }

  // Previous season for growth calc
  let currentId = null
  if (filterSeason) {
    const s = SEASONS.find(s => s.name === filterSeason)
    if (s) currentId = s.id
  }
  if (!currentId) currentId = SEASONS.find(s => s.status === 'in-progress')?.id
  const currentType = currentId ? getSeasonType(currentId) : null
  const prev = currentType
    ? [...SEASONS].reverse().find(s => getSeasonType(s.id) === currentType && s.id !== currentId)
    : null
  const prevRecords = prev ? allData.filter(r => r.seasonId === prev.id && r.stage === 'harvested') : []
  const prevByCrop = {}
  for (const r of prevRecords) {
    if (!prevByCrop[r.crop]) prevByCrop[r.crop] = { s: 0, n: 0 }
    prevByCrop[r.crop].s += r.yieldPerAcre
    prevByCrop[r.crop].n++
  }

  return Object.values(byCrop).map(g => {
    const avgYield = g.harvestedCount > 0 ? +(g.harvestedYieldSum / g.harvestedCount).toFixed(3) : null
    const prevData = prevByCrop[g.crop]
    const prevYield = prevData && prevData.n > 0 ? +(prevData.s / prevData.n).toFixed(3) : null
    const growthPct = avgYield != null && prevYield != null && prevYield > 0
      ? +((avgYield - prevYield) / prevYield * 100).toFixed(1) : null
    const variancePct = g.harvestedCount > 0
      ? +((g.harvestedActProd / g.harvestedArea - g.expProd / g.area) / (g.expProd / g.area) * 100).toFixed(1)
      : null

    return {
      crop: g.crop,
      area: +g.area.toFixed(1),
      expectedYield: +(g.expProd / g.area).toFixed(3),
      actualYield: avgYield,
      yieldPerAcre: avgYield,
      prevSeasonYield: prevYield,
      growthPct,
      variancePct,
      benchmark: g.benchCount > 0 ? +(g.benchSum / g.benchCount).toFixed(3) : null,
      status: variancePct != null
        ? (variancePct >= -5 ? 'On Track' : variancePct >= -15 ? 'Watch' : 'Underperforming')
        : 'Pending',
      totalProduction: +g.totalProd.toFixed(1),
      recordCount: g.count,
    }
  })
}

// ── Seasonal yield trend (for Crop Performance charts) ────────────────────

export function computeSeasonalTrend(allData, cropFilter) {
  const bySC = {}
  for (const r of allData) {
    if (r.stage !== 'harvested') continue
    if (cropFilter && r.crop !== cropFilter) continue
    const key = `${r.seasonId}__${r.crop}`
    if (!bySC[key]) bySC[key] = { seasonId: r.seasonId, season: r.season, crop: r.crop, ySum: 0, n: 0 }
    bySC[key].ySum += r.yieldPerAcre
    bySC[key].n++
  }
  return Object.values(bySC).map(d => ({
    season: d.season, crop: d.crop, avgYield: +(d.ySum / d.n).toFixed(3),
  }))
}

// ── Dev-only reconcile check ──────────────────────────────────────────────

export function reconcileCheck(filtered) {
  if (!import.meta.env.DEV) return

  const overviewArea = +(filtered.reduce((s, r) => s + r.area, 0)).toFixed(2)
  const overviewProd = +(filtered.reduce((s, r) => s + r.production, 0)).toFixed(2)

  // Crop Performance totals
  const byCrop = {}
  for (const r of filtered) {
    if (!byCrop[r.crop]) byCrop[r.crop] = { area: 0, prod: 0 }
    byCrop[r.crop].area += r.area
    byCrop[r.crop].prod += r.production
  }
  const cropArea = +(Object.values(byCrop).reduce((s, c) => s + c.area, 0)).toFixed(2)
  const cropProd = +(Object.values(byCrop).reduce((s, c) => s + c.prod, 0)).toFixed(2)

  // Farmer & Field totals
  const byFarmer = {}
  for (const r of filtered) {
    if (!byFarmer[r.farmerId]) byFarmer[r.farmerId] = { area: 0, prod: 0, ids: [] }
    byFarmer[r.farmerId].area += r.area
    byFarmer[r.farmerId].prod += r.production
    byFarmer[r.farmerId].ids.push(r._id)
  }
  const farmerArea = +(Object.values(byFarmer).reduce((s, f) => s + f.area, 0)).toFixed(2)
  const farmerProd = +(Object.values(byFarmer).reduce((s, f) => s + f.prod, 0)).toFixed(2)

  // Drawer check: each farmer's drawer rows must equal their table rows
  let drawerOk = true
  for (const [fid, info] of Object.entries(byFarmer)) {
    const drawerRows = filtered.filter(r => r.farmerId === fid)
    if (drawerRows.length !== info.ids.length) { drawerOk = false; break }
  }

  const areaOk = Math.abs(overviewArea - cropArea) < 0.05 && Math.abs(overviewArea - farmerArea) < 0.05
  const prodOk = Math.abs(overviewProd - cropProd) < 0.5 && Math.abs(overviewProd - farmerProd) < 0.5
  const pass = areaOk && prodOk && drawerOk

  console.info(
    `[CropYieldAnalytics] Reconcile: ${pass ? 'PASS ✓' : 'FAIL ✗'}`,
    `area(${overviewArea}=${cropArea}=${farmerArea})`,
    `prod(${overviewProd}=${cropProd}=${farmerProd})`,
    `drawer:${drawerOk ? 'ok' : 'MISMATCH'}`,
  )
}

/** Re-export constants for UI convenience */
export { CROPS, SEASONS, REGIONAL_BENCHMARKS }
