/**
 * mockData.js — Crop & Yield Analytics Module
 *
 * Deterministic data generator. NEVER imported by UI components — only api.js.
 *
 * generateYieldData(farmers) produces RAW yield records seeded from each
 * farmer's _id for stability — a farmer's records are identical regardless
 * of what other farmers are in the list or their order.
 *
 * Derived fields (production, variancePct, status, yieldPerAcre, isProjected)
 * are computed later by enrichRecord() in utils.js, called in api.js.
 *
 * Units: acres (area), tonnes (production), tonnes/acre (yield)
 */

import {
  REFERENCE_DATE,
  deterministicSeed,
  seedRange,
  getCropStage,
  getConfidence,
} from './utils'

// ═══════════════════════════════════════════════════════════════════════════
// CROPS
// ═══════════════════════════════════════════════════════════════════════════

export const CROPS = [
  { name: 'Rice (Paddy)', category: 'Cereal',    minYield: 1.8, maxYield: 2.6 },
  { name: 'Cotton',       category: 'Cash Crop', minYield: 0.4, maxYield: 0.7 },
  { name: 'Maize',        category: 'Cereal',    minYield: 1.5, maxYield: 2.5 },
  { name: 'Groundnut',    category: 'Oilseed',   minYield: 0.5, maxYield: 0.9 },
  { name: 'Chilli',       category: 'Spice',     minYield: 0.8, maxYield: 1.5 },
  { name: 'Sugarcane',    category: 'Cash Crop', minYield: 30,  maxYield: 40 },
  { name: 'Redgram (Tur)', category: 'Pulse',    minYield: 0.3, maxYield: 0.6 },
  { name: 'Turmeric',     category: 'Spice',     minYield: 2.5, maxYield: 4.0 },
]

// ═══════════════════════════════════════════════════════════════════════════
// SEASONS
// ═══════════════════════════════════════════════════════════════════════════

export const SEASONS = [
  { id: 'kharif_2025',  name: 'Kharif 2025',  startDate: '2025-06-01', endDate: '2025-11-30', status: 'completed' },
  { id: 'rabi_2025_26', name: 'Rabi 2025-26', startDate: '2025-11-01', endDate: '2026-04-30', status: 'completed' },
  { id: 'kharif_2026',  name: 'Kharif 2026',  startDate: '2026-06-01', endDate: '2026-11-30', status: 'in-progress' },
]

// ═══════════════════════════════════════════════════════════════════════════
// REGIONAL BENCHMARKS (district avg yield per crop, tonnes/acre)
// ═══════════════════════════════════════════════════════════════════════════

export const REGIONAL_BENCHMARKS = {
  Nalgonda:   { 'Rice (Paddy)': 2.1, Cotton: 0.52, Maize: 1.9, Groundnut: 0.68, Chilli: 1.0, Sugarcane: 33, 'Redgram (Tur)': 0.40, Turmeric: 3.0 },
  Warangal:   { 'Rice (Paddy)': 2.2, Cotton: 0.55, Maize: 2.0, Groundnut: 0.65, Chilli: 1.1, Sugarcane: 34, 'Redgram (Tur)': 0.42, Turmeric: 3.1 },
  Karimnagar: { 'Rice (Paddy)': 1.9, Cotton: 0.50, Maize: 1.8, Groundnut: 0.62, Chilli: 0.95, Sugarcane: 32, 'Redgram (Tur)': 0.38, Turmeric: 2.8 },
  Nizamabad:  { 'Rice (Paddy)': 2.3, Cotton: 0.54, Maize: 2.0, Groundnut: 0.72, Chilli: 1.05, Sugarcane: 35, 'Redgram (Tur)': 0.41, Turmeric: 3.3 },
  Khammam:    { 'Rice (Paddy)': 2.1, Cotton: 0.53, Maize: 2.1, Groundnut: 0.60, Chilli: 1.0, Sugarcane: 33, 'Redgram (Tur)': 0.39, Turmeric: 2.9 },
  Guntur:     { 'Rice (Paddy)': 2.4, Cotton: 0.58, Maize: 2.1, Groundnut: 0.68, Chilli: 1.3, Sugarcane: 36, 'Redgram (Tur)': 0.43, Turmeric: 3.2 },
  Kurnool:    { 'Rice (Paddy)': 1.8, Cotton: 0.45, Maize: 1.7, Groundnut: 0.58, Chilli: 0.90, Sugarcane: 31, 'Redgram (Tur)': 0.36, Turmeric: 2.7 },
}

// ═══════════════════════════════════════════════════════════════════════════
// FALLBACK FARMERS — used when API call fails or returns 0 farmers
// ═══════════════════════════════════════════════════════════════════════════

export const FALLBACK_FARMERS = [
  { _id: 'fb_001', fullName: 'Ramesh Reddy',     district: 'Nalgonda',   state: 'Telangana',       totalLandArea: 12 },
  { _id: 'fb_002', fullName: 'Venkata Reddy',    district: 'Nalgonda',   state: 'Telangana',       totalLandArea: 8 },
  { _id: 'fb_003', fullName: 'Suresh Kumar',     district: 'Warangal',   state: 'Telangana',       totalLandArea: 14 },
  { _id: 'fb_004', fullName: 'Padma Devi',       district: 'Warangal',   state: 'Telangana',       totalLandArea: 10 },
  { _id: 'fb_005', fullName: 'Raghavendra',      district: 'Karimnagar', state: 'Telangana',       totalLandArea: 12 },
  { _id: 'fb_006', fullName: 'Balaji Reddy',     district: 'Nizamabad',  state: 'Telangana',       totalLandArea: 14 },
  { _id: 'fb_007', fullName: 'Krishna Murthy',   district: 'Guntur',     state: 'Andhra Pradesh',  totalLandArea: 15 },
  { _id: 'fb_008', fullName: 'Obul Reddy',       district: 'Kurnool',    state: 'Andhra Pradesh',  totalLandArea: 10 },
  { _id: 'fb_009', fullName: 'Lakshmi Prasad',   district: 'Khammam',    state: 'Telangana',       totalLandArea: 11 },
  { _id: 'fb_010', fullName: 'Ravi Shankar',     district: 'Guntur',     state: 'Andhra Pradesh',  totalLandArea: 12 },
]

// ═══════════════════════════════════════════════════════════════════════════
// Crop assignments per season
// ═══════════════════════════════════════════════════════════════════════════

const KHARIF_CROPS = ['Rice (Paddy)', 'Cotton', 'Maize', 'Chilli', 'Sugarcane', 'Redgram (Tur)']
const RABI_CROPS   = ['Groundnut', 'Chilli', 'Maize', 'Turmeric', 'Rice (Paddy)']

function pickCrop(seedKey, cropList) {
  return cropList[Math.floor(deterministicSeed(seedKey) * cropList.length)]
}

function getCropMeta(cropName) {
  return CROPS.find(c => c.name === cropName) || CROPS[0]
}

// ═══════════════════════════════════════════════════════════════════════════
// generateYieldData(farmers) → raw records (no derived fields)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Deterministic generator — seeded ONLY from each farmer's _id.
 * A farmer's records are identical regardless of list order.
 *
 * @param {Array} farmers - [{ _id, fullName, district, state, totalLandArea }]
 * @returns {Array} raw yield records (enrich with enrichRecord before use)
 */
export function generateYieldData(farmers) {
  // Normalise: API farmers may lack totalLandArea or use `name` instead of `fullName`
  const normalised = farmers.map(f => ({
    ...f,
    fullName: f.fullName || f.name || f._id,
    totalLandArea: f.totalLandArea || 10,
  }))
  const validFarmers = normalised.filter(f => f.totalLandArea > 0 && f._id)
  const records = []

  for (const farmer of validFarmers) {
    const fid = farmer._id
    const seasonCount = deterministicSeed(fid + '_sc') < 0.25 ? 2 : 3
    const participatingSeasons = SEASONS.slice(SEASONS.length - seasonCount)

    for (const season of participatingSeasons) {
      const pcSeed = deterministicSeed(fid + season.id + '_pc')
      const plotCount = pcSeed < 0.20 ? 1 : pcSeed < 0.80 ? 2 : 3
      let areaUsed = 0

      for (let pi = 0; pi < plotCount; pi++) {
        const ps = `${fid}_${season.id}_p${pi}` // plot seed

        const maxArea = farmer.totalLandArea - areaUsed
        if (maxArea < 0.1) break

        const area = +Math.max(0.1, Math.min(seedRange(ps + '_area', 2, Math.min(7, maxArea)), maxArea)).toFixed(1)
        areaUsed += area

        const isKharif = season.id.startsWith('kharif')
        const crop = pickCrop(ps + '_crop', isKharif ? KHARIF_CROPS : RABI_CROPS)
        const meta = getCropMeta(crop)
        const plotName = `${farmer.fullName.split(' ')[0]} Plot ${String.fromCharCode(65 + pi)}`

        // Dates
        const sowDate = new Date(season.startDate)
        sowDate.setDate(sowDate.getDate() + Math.round(deterministicSeed(ps + '_sow') * 20))
        const sowStr = sowDate.toISOString().split('T')[0]

        const isSugarcane = crop === 'Sugarcane'
        const isTurmeric = crop === 'Turmeric'
        const growDays = Math.round(seedRange(ps + '_grow',
          isSugarcane ? 300 : isTurmeric ? 240 : 90,
          isSugarcane ? 360 : isTurmeric ? 280 : 160, 0))
        const harvestDate = new Date(sowDate)
        harvestDate.setDate(harvestDate.getDate() + growDays)
        const harvestStr = harvestDate.toISOString().split('T')[0]

        // Expected yield
        const expectedYield = seedRange(ps + '_ey', meta.minYield, meta.maxYield)

        // Stage
        const stage = getCropStage(sowStr, harvestStr, REFERENCE_DATE)
        const isDone = stage === 'harvested' || season.status === 'completed'

        // Actual yield — only for completed/harvested
        const varianceFactor = deterministicSeed(ps + '_var') * 0.35 - 0.20
        const actualYield = isDone ? +(expectedYield * (1 + varianceFactor)).toFixed(3) : null

        // Forecast yield — only for in-progress, unharvested
        const forecastAdj = deterministicSeed(ps + '_fc') * 0.10 - 0.05
        const forecastYield = (!isDone && season.status === 'in-progress')
          ? +(expectedYield * (1 + forecastAdj)).toFixed(3) : undefined

        // Confidence
        const confidence = (!isDone && season.status === 'in-progress')
          ? getConfidence(harvestStr, stage, REFERENCE_DATE) : null

        // Actual harvest date
        let actualHarvestDate = null
        if (isDone) {
          const d = new Date(harvestDate)
          d.setDate(d.getDate() + Math.round(deterministicSeed(ps + '_hd') * 10 - 5))
          actualHarvestDate = d.toISOString().split('T')[0]
        }

        const district = farmer.district || 'Nalgonda'

        records.push({
          _id: `yd_${fid}_${season.id}_p${pi}`,
          farmerId: fid,
          farmerName: farmer.fullName,
          plotName,
          crop,
          season: season.name,
          seasonId: season.id,
          area,
          district,
          state: farmer.state || 'Telangana',
          sowingDate: sowStr,
          harvestDate: harvestStr,
          actualHarvestDate,
          expectedYield,
          actualYield,
          forecastYield,
          stage,
          confidence,
          regionalBenchmark: REGIONAL_BENCHMARKS[district]?.[crop] ?? null,
        })
      }
    }
  }

  // ── Crop-coverage guarantee: fill any missing crops ────────────────────
  const present = new Set(records.map(r => r.crop))
  const coverSeason = SEASONS[SEASONS.length - 1]
  for (const cropDef of CROPS) {
    if (present.has(cropDef.name)) continue
    const farmer = validFarmers[0]
    const cs = `cover_${cropDef.name}`
    const area = seedRange(cs + '_a', 2, 5)
    const sowDate = new Date(coverSeason.startDate)
    sowDate.setDate(sowDate.getDate() + Math.round(deterministicSeed(cs + '_s') * 15))
    const sowStr = sowDate.toISOString().split('T')[0]
    const isSugarcane = cropDef.name === 'Sugarcane'
    const isTurmeric = cropDef.name === 'Turmeric'
    const growDays = Math.round(seedRange(cs + '_g',
      isSugarcane ? 300 : isTurmeric ? 240 : 100,
      isSugarcane ? 340 : isTurmeric ? 270 : 140, 0))
    const hd = new Date(sowDate)
    hd.setDate(hd.getDate() + growDays)
    const harvestStr = hd.toISOString().split('T')[0]
    const expectedYield = seedRange(cs + '_ey', cropDef.minYield, cropDef.maxYield)
    const stage = getCropStage(sowStr, harvestStr, REFERENCE_DATE)
    const isDone = stage === 'harvested' || coverSeason.status === 'completed'
    const vf = deterministicSeed(cs + '_v') * 0.35 - 0.20
    const actualYield = isDone ? +(expectedYield * (1 + vf)).toFixed(3) : null
    const fcAdj = deterministicSeed(cs + '_fc') * 0.10 - 0.05
    const forecastYield = (!isDone && coverSeason.status === 'in-progress')
      ? +(expectedYield * (1 + fcAdj)).toFixed(3) : undefined
    const district = farmer.district || 'Nalgonda'

    records.push({
      _id: `yd_cover_${cropDef.name.replace(/\s+/g, '_').toLowerCase()}`,
      farmerId: farmer._id,
      farmerName: farmer.fullName,
      plotName: `${farmer.fullName.split(' ')[0]} Cover`,
      crop: cropDef.name,
      season: coverSeason.name,
      seasonId: coverSeason.id,
      area,
      district,
      state: farmer.state || 'Telangana',
      sowingDate: sowStr,
      harvestDate: harvestStr,
      actualHarvestDate: isDone ? harvestStr : null,
      expectedYield,
      actualYield,
      forecastYield,
      stage,
      confidence: (!isDone && coverSeason.status === 'in-progress')
        ? getConfidence(harvestStr, stage, REFERENCE_DATE) : null,
      regionalBenchmark: REGIONAL_BENCHMARKS[district]?.[cropDef.name] ?? null,
    })
  }

  return records
}
