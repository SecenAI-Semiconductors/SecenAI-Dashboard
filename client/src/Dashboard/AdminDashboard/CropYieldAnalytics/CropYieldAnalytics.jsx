/**
 * CropYieldAnalytics.jsx — Shell + Overview tab
 *
 * Shell: page header, tabs, dependent global filters, loading skeleton, empty state.
 * Data flow: load allData once → filter in useMemo via applyFilters → same set for every tab.
 *
 * Filter order: Farmer, Season, Crop, District.
 * Options come from getFilterOptions (each dropdown sees only values valid given the other filters).
 * Farmer selection auto-sets district; clearing farmer resets auto-set district.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts'
import './CropYieldAnalytics.css'
import { getFarmers, getYieldData, applyFilters, getFilterOptions, computeYieldGrowth, reconcileCheck, CROPS, SEASONS } from './api'
import { CHART_COLORS, formatNumber, formatArea, formatYield, formatPercent, REFERENCE_DATE } from './utils'
import { CropPerformanceTab } from './CropPerformanceTab'
import { FarmerFieldTab } from './FarmerFieldTab'
import { HarvestForecastTab } from './HarvestForecastTab'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'crop',     label: 'Crop Performance' },
  { id: 'farmer',   label: 'Farmer & Field' },
  { id: 'forecast', label: 'Harvest Forecast' },
]

export function CropYieldAnalytics() {
  const [activeTab, setActiveTab] = useState('overview')
  const [allData, setAllData] = useState([])
  const [loading, setLoading] = useState(true)

  // ── Filter state (single object) ──
  const [filters, setFilters] = useState({ farmerId: '', season: '', crop: '', district: '' })
  const [districtAutoSet, setDistrictAutoSet] = useState(false)

  const loggedRef = useRef(false)

  // ── Load once ──
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const { farmers: f, source } = await getFarmers()
      const data = await getYieldData()
      setAllData(data)

      if (!loggedRef.current) {
        loggedRef.current = true
        const seasonCounts = {}
        const cropYields = {}
        for (const r of data) {
          seasonCounts[r.season] = (seasonCounts[r.season] || 0) + 1
          if (!cropYields[r.crop]) cropYields[r.crop] = { min: Infinity, max: -Infinity }
          const y = r.actualYield ?? r.forecastYield ?? r.expectedYield
          if (y < cropYields[r.crop].min) cropYields[r.crop].min = +y.toFixed(3)
          if (y > cropYields[r.crop].max) cropYields[r.crop].max = +y.toFixed(3)
        }
        console.info('[CropYieldAnalytics] Summary:', { source, farmerCount: f.length, recordsPerSeason: seasonCounts, yieldRangesPerCrop: cropYields })
        // DEBUG: per-farmer record count
        const perFarmer = {}
        for (const r of data) {
          if (!perFarmer[r.farmerId]) perFarmer[r.farmerId] = { name: r.farmerName, count: 0 }
          perFarmer[r.farmerId].count++
        }
        console.info('[CropYieldAnalytics] Records per farmer:', perFarmer)
        console.info('[CropYieldAnalytics] Farmers in records:', Object.keys(perFarmer).length, 'vs loaded:', f.length)
      }
    } catch (err) {
      console.error('[CropYieldAnalytics] Load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ── Dependent filter options ──
  // When district was auto-set from a farmer, the farmer dropdown must still
  // show ALL farmers (ignoring the auto-set district) so the user can switch.
  const options = useMemo(() => {
    const base = getFilterOptions(allData, filters)
    if (districtAutoSet && filters.district) {
      const { farmers } = getFilterOptions(allData, { ...filters, district: '' })
      return { ...base, farmers }
    }
    return base
  }, [allData, filters, districtAutoSet])

  // ── Validate: if a current selection is no longer in its option list, reset it ──
  useEffect(() => {
    const next = { ...filters }
    let changed = false
    if (next.farmerId && !options.farmers.some(f => f.id === next.farmerId)) {
      next.farmerId = ''
      if (districtAutoSet) { next.district = ''; setDistrictAutoSet(false) }
      changed = true
    }
    if (next.season && !options.seasons.includes(next.season)) { next.season = ''; changed = true }
    if (next.crop && !options.crops.includes(next.crop)) { next.crop = ''; changed = true }
    if (next.district && !options.districts.includes(next.district)) { next.district = ''; changed = true }
    if (changed) setFilters(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options])

  // ── Apply filters once — same set for every tab ──
  const filtered = useMemo(() => applyFilters(allData, filters), [allData, filters])

  // ── Dev reconcile ──
  useEffect(() => {
    if (filtered.length > 0) reconcileCheck(filtered)
  }, [filtered])

  // ── Filter change handlers ──

  function handleFarmerChange(val) {
    if (val) {
      // Farmer selected → auto-set district; auto-select season/crop if only one
      const recs = allData.filter(r => r.farmerId === val)
      if (recs.length > 0) {
        const district = recs[0].district
        const ss = [...new Set(recs.map(r => r.season))]
        const cs = [...new Set(recs.map(r => r.crop))]
        setFilters({
          farmerId: val,
          season: ss.length === 1 ? ss[0] : '',
          crop: cs.length === 1 ? cs[0] : '',
          district,
        })
        setDistrictAutoSet(true)
        return
      }
    }
    // Farmer cleared → reset auto-set district
    setFilters(prev => ({
      ...prev,
      farmerId: '',
      district: districtAutoSet ? '' : prev.district,
    }))
    if (districtAutoSet) setDistrictAutoSet(false)
  }

  function handleDistrictChange(val) {
    setDistrictAutoSet(false) // user explicitly chose
    updateFilter('district', val)
  }

  function updateFilter(key, value) {
    setFilters(prev => {
      const next = { ...prev, [key]: value }
      // Validate other filters against new options
      const opts = getFilterOptions(allData, next)
      if (key !== 'farmerId' && next.farmerId && !opts.farmers.some(f => f.id === next.farmerId)) next.farmerId = ''
      if (key !== 'season'   && next.season   && !opts.seasons.includes(next.season))   next.season = ''
      if (key !== 'crop'     && next.crop     && !opts.crops.includes(next.crop))       next.crop = ''
      if (key !== 'district' && next.district && !opts.districts.includes(next.district)) next.district = ''
      return next
    })
  }

  function resetFilters() {
    setFilters({ farmerId: '', season: '', crop: '', district: '' })
    setDistrictAutoSet(false)
  }

  return (
    <div className="dashboard-view" id="crop-yield-analytics-page">
      <section className="dashboard-content" style={{ maxWidth: 1200 }}>
        <div className="cya-header">
          <div className="cya-header-left">
            <h1>Crop &amp; Yield Analytics</h1>
            <p>Track crop performance, harvest forecasts, and yield comparisons.</p>
          </div>
        </div>

        <div className="cya-tabs" role="tablist">
          {TABS.map(t => (
            <button key={t.id} id={`cya-tab-${t.id}`} role="tab"
              aria-selected={activeTab === t.id}
              className={`cya-tab${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* Filter order: Farmer, Season, Crop, District */}
        <div className="cya-filters" id="cya-filter-bar">
          <select className="cya-filter-select" value={filters.farmerId} onChange={e => handleFarmerChange(e.target.value)} id="cya-filter-farmer">
            <option value="">All Farmers</option>
            {options.farmers.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <select className="cya-filter-select" value={filters.season} onChange={e => updateFilter('season', e.target.value)} id="cya-filter-season">
            <option value="">All Seasons</option>
            {options.seasons.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="cya-filter-select" value={filters.crop} onChange={e => updateFilter('crop', e.target.value)} id="cya-filter-crop">
            <option value="">All Crops</option>
            {options.crops.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="cya-filter-select" value={filters.district} onChange={e => handleDistrictChange(e.target.value)} id="cya-filter-district">
            <option value="">All Districts</option>
            {options.districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {loading ? <LoadingSkeleton /> : allData.length === 0 ? (
          <NoDataState />
        ) : (
          <>
            {activeTab === 'overview'  && <OverviewTab data={filtered} allData={allData} filterSeason={filters.season} />}
            {activeTab === 'crop'      && <CropPerformanceTab data={filtered} allData={allData} filterSeason={filters.season} />}
            {activeTab === 'farmer'    && <FarmerFieldTab data={filtered} allData={allData} />}
            {activeTab === 'forecast'  && <HarvestForecastTab data={filtered} />}
          </>
        )}
      </section>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════════════════════════════════ */

function OverviewTab({ data, allData, filterSeason }) {
  // ── Determine which season counts as "in-progress" ──
  const activeSeason = useMemo(() => {
    if (filterSeason) {
      const s = SEASONS.find(s => s.name === filterSeason)
      return s || SEASONS.find(s => s.status === 'in-progress')
    }
    return SEASONS.find(s => s.status === 'in-progress')
  }, [filterSeason])

  // ── KPIs ──
  const kpis = useMemo(() => {
    let totalArea = 0, expProd = 0, totalProd = 0, yieldSum = 0, yieldN = 0
    let seasonArea = 0, seasonHarvestedArea = 0

    for (const r of data) {
      totalArea += r.area
      expProd += r.expectedYield * r.area
      totalProd += r.production

      if (r.stage === 'harvested') { yieldSum += r.yieldPerAcre; yieldN++ }

      // Harvest completion: in-progress season only
      if (activeSeason && (r.season === activeSeason.name || r.seasonId === activeSeason.id)) {
        seasonArea += r.area
        if (r.stage === 'harvested') seasonHarvestedArea += r.area
      }
    }

    const harvestPct = seasonArea > 0 ? +(seasonHarvestedArea / seasonArea * 100).toFixed(1) : 0
    const growthPct = computeYieldGrowth(allData, filterSeason)

    return {
      totalArea: +totalArea.toFixed(1),
      expProd: +expProd.toFixed(1),
      totalProd: +totalProd.toFixed(1),
      avgYield: yieldN > 0 ? +(yieldSum / yieldN).toFixed(2) : null,
      growthPct,
      harvestPct,
    }
  }, [data, allData, activeSeason, filterSeason])

  // ── Production Trend (harvested only) ──
  const trendData = useMemo(() => {
    const m = {}
    for (const r of data) {
      if (r.stage !== 'harvested') continue
      if (!m[r.season]) m[r.season] = { season: r.season, expected: 0, actual: 0 }
      m[r.season].expected += r.expectedYield * r.area
      m[r.season].actual += r.actualYield * r.area
    }
    return SEASONS.map(s => {
      const d = m[s.name]
      return d ? { season: s.name, expected: +d.expected.toFixed(1), actual: +d.actual.toFixed(1) }
               : { season: s.name, expected: 0, actual: 0 }
    })
  }, [data])

  // ── Crop Distribution (area, all records) ──
  const cropDistData = useMemo(() => {
    const m = {}
    for (const r of data) m[r.crop] = (m[r.crop] || 0) + r.area
    return Object.entries(m).map(([name, value]) => ({ name, value: +value.toFixed(1) })).sort((a, b) => b.value - a.value)
  }, [data])

  // ── Expected vs Actual % bar (harvested only) ──
  const expVsActData = useMemo(() => {
    const m = {}
    for (const r of data) {
      if (r.stage !== 'harvested') continue
      if (!m[r.crop]) m[r.crop] = { crop: r.crop, exp: 0, act: 0 }
      m[r.crop].exp += r.expectedYield * r.area
      m[r.crop].act += r.actualYield * r.area
    }
    return Object.values(m).map(d => ({
      crop: d.crop.replace(' (Paddy)', '').replace(' (Tur)', ''),
      pct: d.exp > 0 ? +((d.act / d.exp) * 100).toFixed(1) : 0,
    }))
  }, [data])

  // ── Harvest Completion progress bars (active season only) ──
  const harvestProgress = useMemo(() => {
    if (!activeSeason) return []
    const m = {}
    for (const r of data) {
      if (r.season !== activeSeason.name && r.seasonId !== activeSeason.id) continue
      if (!m[r.crop]) m[r.crop] = { crop: r.crop, total: 0, harvested: 0 }
      m[r.crop].total += r.area
      if (r.stage === 'harvested') m[r.crop].harvested += r.area
    }
    return Object.values(m)
      .map(d => ({ ...d, pct: d.total > 0 ? +(d.harvested / d.total * 100).toFixed(0) : 0 }))
      .sort((a, b) => b.pct - a.pct)
  }, [data, activeSeason])

  return (
    <>
      <div className="cya-stats-grid" id="cya-kpi-cards">
        <StatCard title="Total Cultivated Area"  value={formatArea(kpis.totalArea)}                   icon="🌾" accent={CHART_COLORS.green} />
        <StatCard title="Expected Production"    value={`${formatNumber(kpis.expProd, 1)} t`}         icon="📊" accent={CHART_COLORS.blue} />
        <StatCard title="Total Production"       value={`${formatNumber(kpis.totalProd, 1)} t`}       icon="📦" accent={CHART_COLORS.teal} />
        <StatCard title="Avg Yield / Acre"       value={kpis.avgYield != null ? formatYield(kpis.avgYield) : '—'} icon="📈" accent={CHART_COLORS.gold} />
        <StatCard title="Yield Growth %"         value={kpis.growthPct != null ? formatPercent(kpis.growthPct) : '—'} icon="🔄" accent={CHART_COLORS.purple} />
        <StatCard title="Harvest Completion"     value={`${kpis.harvestPct}%`}                        icon="✅" accent={CHART_COLORS.greenDark} />
      </div>

      <div className="cya-charts-row">
        {/* Production Trend */}
        <div className="cya-card">
          <h3 className="cya-section-title">Production Trend</h3>
          <p className="cya-section-subtitle">Expected vs actual production by season (harvested only)</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis dataKey="season" tick={{ fontSize: 11, fill: CHART_COLORS.axis }} axisLine={{ stroke: CHART_COLORS.axisLine }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} tickFormatter={v => `${v}t`} width={60} />
              <Tooltip content={<CyaTooltip unit="t" />} />
              <Line type="monotone" dataKey="expected" stroke={CHART_COLORS.blue} strokeWidth={2} dot={{ r: 4 }} name="Expected" />
              <Line type="monotone" dataKey="actual" stroke={CHART_COLORS.green} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS.green }} name="Actual" />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Crop Distribution */}
        <div className="cya-card">
          <h3 className="cya-section-title">Crop Distribution</h3>
          <p className="cya-section-subtitle">Area under cultivation by crop (acres)</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={cropDistData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={2} dataKey="value" nameKey="name">
                {cropDistData.map((_, i) => <Cell key={i} fill={CHART_COLORS.series[i % CHART_COLORS.series.length]} />)}
              </Pie>
              <Tooltip content={<CyaTooltip unit="acres" />} />
              <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="cya-charts-row">
        {/* Expected vs Actual % */}
        <div className="cya-card">
          <h3 className="cya-section-title">Expected vs Actual</h3>
          <p className="cya-section-subtitle">Actual production as % of expected (harvested only)</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expVsActData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis dataKey="crop" tick={{ fontSize: 10, fill: CHART_COLORS.axis }} axisLine={{ stroke: CHART_COLORS.axisLine }} tickLine={false} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={50} domain={[0, 'auto']} />
              <ReferenceLine y={100} stroke={CHART_COLORS.gold} strokeDasharray="6 3" strokeWidth={1.5} label={{ value: '100%', position: 'right', fontSize: 11, fill: CHART_COLORS.gold }} />
              <Tooltip content={<CyaTooltip unit="%" />} />
              <Bar dataKey="pct" fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} name="Actual %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Harvest Completion */}
        <div className="cya-card">
          <h3 className="cya-section-title">Harvest Completion</h3>
          <p className="cya-section-subtitle">{activeSeason ? activeSeason.name : 'Current season'} — harvested area / total area</p>
          {harvestProgress.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No data for this season</p>
          ) : (
            <div className="cya-progress-list">
              {harvestProgress.map(d => (
                <div className="cya-progress-item" key={d.crop}>
                  <div className="cya-progress-header">
                    <span className="cya-progress-label">{d.crop}</span>
                    <span className="cya-progress-pct">{d.pct}%</span>
                  </div>
                  <div className="cya-progress-track">
                    <div className="cya-progress-fill" style={{
                      width: `${d.pct}%`,
                      background: d.pct >= 80 ? CHART_COLORS.green : d.pct >= 40 ? CHART_COLORS.gold : CHART_COLORS.orange,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED UI
   ═══════════════════════════════════════════════════════════════════════════ */

function StatCard({ title, value, icon, accent }) {
  return (
    <div className="cya-stat-card">
      <div className="cya-stat-icon" style={{ background: `${accent}12`, color: accent }}>{icon}</div>
      <div className="cya-stat-info">
        <span className="cya-stat-label">{title}</span>
        <span className="cya-stat-value">{value ?? '—'}</span>
      </div>
    </div>
  )
}

export function CyaTooltip({ active, payload, unit = '' }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const label = d.season || d.crop || d.name || d.week || ''
  return (
    <div className="cya-tooltip">
      <div className="cya-tooltip-title">{label}</div>
      {payload.map((p, i) => (
        <div className="cya-tooltip-row" key={i}>
          <span className="cya-tooltip-label" style={{ color: p.color }}>{p.name || p.dataKey}</span>
          <span className="cya-tooltip-value">{formatNumber(p.value, 1)} {unit}</span>
        </div>
      ))}
    </div>
  )
}

export function StatusBadge({ status, isProjected }) {
  const cls = status.toLowerCase().replace(/\s+/g, '-')
  return (
    <span className={`cya-status-badge cya-status--${cls}`}>
      {status}{isProjected ? ' (projected)' : ''}
    </span>
  )
}

export function ConfidenceBadge({ confidence }) {
  const cls = confidence.toLowerCase()
  return <span className={`cya-confidence-badge cya-confidence--${cls}`}>{confidence}</span>
}

export function SortIcon({ active, dir }) {
  return <span className={`cya-sort-icon${active ? ' cya-sort-icon--active' : ''}`}>{dir === 'asc' ? '▲' : '▼'}</span>
}

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  const pages = []
  for (let i = 1; i <= totalPages; i++) pages.push(i)
  return (
    <div className="cya-pagination">
      <button className="cya-page-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>← Prev</button>
      <div className="cya-page-numbers">
        {pages.map(p => (
          <button key={p} className={`cya-page-num${p === page ? ' active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
        ))}
      </div>
      <button className="cya-page-btn" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next →</button>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <>
      <div className="cya-stats-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="cya-stat-card" key={i}>
            <div className="cya-skeleton" style={{ width: 44, height: 44, borderRadius: 10 }} />
            <div className="cya-stat-info"><div className="cya-skeleton cya-skeleton--short" /><div className="cya-skeleton cya-skeleton--value" /></div>
          </div>
        ))}
      </div>
      <div className="cya-charts-row">
        <div className="cya-card"><div className="cya-skeleton cya-skeleton--chart" /></div>
        <div className="cya-card"><div className="cya-skeleton cya-skeleton--chart" /></div>
      </div>
    </>
  )
}

/** Shown only when allData is genuinely empty (no records at all). */
function NoDataState() {
  return (
    <div className="cya-empty" id="cya-empty-state">
      <div className="cya-empty-icon">🌾</div>
      <h3>No yield records available</h3>
      <p>No crop & yield data has been generated yet.</p>
    </div>
  )
}

/** Tab-level empty state with optional reset button. */
export function EmptyState({ onReset }) {
  return (
    <div className="cya-empty" id="cya-empty-state">
      <div className="cya-empty-icon">🌾</div>
      <h3>No data found</h3>
      <p>No records match the current view.</p>
      {onReset && (
        <button className="cya-reset-btn" onClick={onReset}>Reset filters</button>
      )}
    </div>
  )
}
