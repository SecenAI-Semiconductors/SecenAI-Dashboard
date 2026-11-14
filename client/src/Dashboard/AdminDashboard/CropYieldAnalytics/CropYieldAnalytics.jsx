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

import { useState, useEffect, useMemo, useCallback, useRef, Component } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts'
import './CropYieldAnalytics.css'
import { getFarmers, getYieldData, getAnalytics, applyFilters, getFilterOptions, computeYieldGrowth, reconcileCheck, resetCache, CROPS, SEASONS } from './api'
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

/** Error boundary — prevents one crashed tab from blanking the whole page. */
class TabErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('[CropYieldAnalytics] Tab error:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="cya-empty" style={{ color: 'var(--text-danger, #dc2626)' }}>
          <div className="cya-empty-icon">⚠️</div>
          <h3>This tab encountered an error</h3>
          <p style={{ fontSize: 13, fontFamily: 'monospace' }}>{this.state.error?.message}</p>
          <button className="cya-reset-btn" onClick={() => this.setState({ hasError: false, error: null })}>
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export function CropYieldAnalytics() {
  const [activeTab, setActiveTab] = useState('overview')
  const [allData, setAllData] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Filter state (single object) ──
  const [filters, setFilters] = useState({ farmerId: '', season: '', crop: '', district: '' })
  const [districtAutoSet, setDistrictAutoSet] = useState(false)

  const loggedRef = useRef(false)

  // ── Load once per mount (always fresh — farmer profiles may have changed) ──
  const loadData = useCallback(async () => {
    resetCache()   // bust the module-level cache so we always fetch latest data
    setLoading(true)
    try {
      const [data, analyticsData] = await Promise.all([getYieldData(), getAnalytics()])
      setAllData(data)
      setAnalytics(analyticsData)

      if (!loggedRef.current) {
        loggedRef.current = true
        console.info('[CropYieldAnalytics] Real data loaded:', {
          totalFarmers:     analyticsData.totalFarmers,
          totalLand:        analyticsData.totalLand,
          cropDistribution: analyticsData.cropDistribution,
          stateBreakdown:   analyticsData.stateBreakdown,
          districtBreakdown: analyticsData.districtBreakdown,
        })
      }
    } catch (err) {
      console.error('[CropYieldAnalytics] Load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ── Dependent filter options ──
  // Farmer list always comes from full allData (fix: selecting farmer A must
  // not hide farmer B from the dropdown due to auto-set district).
  const options = useMemo(() => getFilterOptions(allData, filters), [allData, filters])

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

        {loading ? <LoadingSkeleton /> : !analytics ? (
          <NoDataState />
        ) : (
          <>
            {activeTab === 'overview'  && <TabErrorBoundary key="overview"><OverviewTab data={filtered} allData={allData} analytics={analytics} filterSeason={filters.season} /></TabErrorBoundary>}
            {activeTab === 'crop'      && <TabErrorBoundary key="crop"><CropPerformanceTab data={filtered} allData={allData} filterSeason={filters.season} /></TabErrorBoundary>}
            {activeTab === 'farmer'    && <TabErrorBoundary key="farmer"><FarmerFieldTab data={filtered} allData={allData} /></TabErrorBoundary>}
            {activeTab === 'forecast'  && <TabErrorBoundary key="forecast"><HarvestForecastTab data={filtered} /></TabErrorBoundary>}
          </>
        )}
      </section>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════════════════════════════════ */

function OverviewTab({ data, allData, analytics, filterSeason }) {

  // ── KPIs — computed from filtered data, not the global analytics object ──
  // This ensures selecting a farmer / crop / district updates every number.
  const kpis = useMemo(() => {
    if (!analytics) return { totalFarmers: 0, completeFarmers: 0, incompleteFarmers: 0, totalLand: 0 }
    const distinctIds = new Set(data.map(r => r.farmerId))
    const totalFarmers = distinctIds.size
    // Sum totalLandArea from the farmer list (not crop areas) — crop areas are
    // what's cultivated, totalLandArea is the declared land the farmer owns.
    const farmerListFiltered = (analytics.farmerList || []).filter(f => distinctIds.has(String(f._id)))
    const totalLand = +farmerListFiltered.reduce((s, f) => s + (f.totalLandArea || 0), 0).toFixed(1)
    const incompleteFarmers = farmerListFiltered.filter(f => f.incomplete).length
    const completeFarmers = totalFarmers - incompleteFarmers
    return { totalFarmers, completeFarmers, incompleteFarmers, totalLand }
  }, [analytics, data])

  // ── Crop Distribution — from filtered data ──
  const cropDistData = useMemo(() => {
    const byCrop = {}
    for (const r of data) byCrop[r.crop] = (byCrop[r.crop] || 0) + r.area
    return Object.entries(byCrop)
      .map(([name, value]) => ({ name, value: +value.toFixed(1) }))
      .sort((a, b) => b.value - a.value)
  }, [data])

  // ── State breakdown — from filtered data ──
  const stateData = useMemo(() => {
    const byState = {}
    for (const r of data) byState[r.state] = (byState[r.state] || 0) + r.area
    return Object.entries(byState)
      .map(([state, area]) => ({ state, area: +area.toFixed(1) }))
      .sort((a, b) => b.area - a.area)
  }, [data])

  // ── District breakdown — from filtered data ──
  const districtData = useMemo(() => {
    const byDistrict = {}
    for (const r of data) byDistrict[r.district] = (byDistrict[r.district] || 0) + r.area
    return Object.entries(byDistrict)
      .map(([district, area]) => ({ district, area: +area.toFixed(1) }))
      .sort((a, b) => b.area - a.area)
  }, [data])

  return (
    <>
      <div className="cya-stats-grid" id="cya-kpi-cards">
        <StatCard title="Total Farmers"       value={kpis.totalFarmers}      icon="👨‍🌾" accent={CHART_COLORS.green} />
        <StatCard title="Complete Profiles"   value={kpis.completeFarmers}   icon="✅"   accent={CHART_COLORS.blue} />
        <StatCard title="Incomplete Profiles" value={kpis.incompleteFarmers} icon="⚠️"  accent={CHART_COLORS.gold} />
        <StatCard title="Total Land (acres)"  value={kpis.totalLand != null ? `${kpis.totalLand} ac` : '—'} icon="🌾" accent={CHART_COLORS.teal} />
        <StatCard title="Distinct Crops"      value={cropDistData.length}    icon="🌱"  accent={CHART_COLORS.purple} />
        <StatCard title="Avg Land / Farmer"   value={kpis.completeFarmers > 0 ? `${+(kpis.totalLand / kpis.completeFarmers).toFixed(1)} ac` : '—'} icon="📐" accent={CHART_COLORS.greenDark} />
      </div>

      <div className="cya-charts-row">
        {/* Crop Distribution Pie */}
        <div className="cya-card">
          <h3 className="cya-section-title">Crop Distribution</h3>
          <p className="cya-section-subtitle">Area under cultivation by crop (acres) — real data from farmer profiles</p>
          {cropDistData.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No crop data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={cropDistData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={2} dataKey="value" nameKey="name">
                  {cropDistData.map((_, i) => <Cell key={i} fill={CHART_COLORS.series[i % CHART_COLORS.series.length]} />)}
                </Pie>
                <Tooltip content={<CyaTooltip unit="acres" />} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* State Breakdown Bar */}
        <div className="cya-card">
          <h3 className="cya-section-title">State Breakdown</h3>
          <p className="cya-section-subtitle">Total land area by state (acres)</p>
          {stateData.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No state data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stateData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                <XAxis dataKey="state" tick={{ fontSize: 11, fill: CHART_COLORS.axis }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} width={50} />
                <Tooltip content={<CyaTooltip unit="ac" />} />
                <Bar dataKey="area" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} name="Area (ac)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="cya-charts-row">
        {/* District Breakdown Bar */}
        <div className="cya-card">
          <h3 className="cya-section-title">District Breakdown</h3>
          <p className="cya-section-subtitle">Total land area by district (acres)</p>
          {districtData.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No district data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={districtData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                <XAxis dataKey="district" tick={{ fontSize: 11, fill: CHART_COLORS.axis }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} width={50} />
                <Tooltip content={<CyaTooltip unit="ac" />} />
                <Bar dataKey="area" fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} name="Area (ac)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Crop area table */}
        <div className="cya-card">
          <h3 className="cya-section-title">Crop Area Summary</h3>
          <p className="cya-section-subtitle">Area planted per crop — {kpis.totalFarmers} farmer{kpis.totalFarmers !== 1 ? 's' : ''} in current view</p>
          <div className="cya-table-container">
            <table className="cya-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Area (acres)</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {cropDistData.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No data</td></tr>
                ) : cropDistData.map(c => (
                  <tr key={c.name}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td>{c.value}</td>
                    <td>{kpis.totalLand > 0 ? `${+(c.value / kpis.totalLand * 100).toFixed(1)}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
  if (!status) return <span className="cya-status-badge cya-status--pending">—</span>
  const cls = status.toLowerCase().replace(/\s+/g, '-')
  return (
    <span className={`cya-status-badge cya-status--${cls}`}>
      {status}{isProjected ? ' (projected)' : ''}
    </span>
  )
}

export function ConfidenceBadge({ confidence }) {
  if (!confidence) return <span className="cya-confidence-badge">—</span>
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
