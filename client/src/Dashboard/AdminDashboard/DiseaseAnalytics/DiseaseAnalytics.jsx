import { useState, useEffect, useCallback } from 'react'
import './DiseaseAnalytics.css'
import { getOverview, getOutbreaks, getHeatmap, getTreatmentEffectiveness, getCases } from './api'
import { OutbreakPatterns } from './OutbreakPatterns'
import { RiskHeatmap } from './RiskHeatmap'
import { TreatmentTable } from './TreatmentTable'
import { CaseTable } from './CaseTable'
import { CaseDetailDrawer } from './CaseDetailDrawer'

const CROPS = ['Corn', 'Rice', 'Chili', 'Cotton', 'Wheat', 'Soybean']
const SEVERITIES = ['Critical', 'High', 'Moderate', 'Low']

export function DiseaseAnalytics() {
  // ── Overview stats ──
  const [overview, setOverview] = useState(null)
  const [overviewLoading, setOverviewLoading] = useState(true)

  // ── Outbreaks ──
  const [outbreaks, setOutbreaks] = useState(null)
  const [outbreaksLoading, setOutbreaksLoading] = useState(true)

  // ── Heatmap ──
  const [heatmapData, setHeatmapData] = useState(null)
  const [heatmapLoading, setHeatmapLoading] = useState(true)

  // ── Treatment ──
  const [treatments, setTreatments] = useState(null)
  const [treatmentsLoading, setTreatmentsLoading] = useState(true)

  // ── Cases ──
  const [casesData, setCasesData] = useState(null)
  const [casesLoading, setCasesLoading] = useState(true)
  const [casePage, setCasePage] = useState(1)

  // ── Filters ──
  const [filterCrop, setFilterCrop] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('')
  const [filterRegion, setFilterRegion] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')

  // ── Drawer ──
  const [selectedCaseId, setSelectedCaseId] = useState(null)

  // ── Fetch overview + outbreaks + heatmap + treatments (one-time) ──
  useEffect(() => {
    getOverview()
      .then(d => setOverview(d))
      .catch(() => setOverview(null))
      .finally(() => setOverviewLoading(false))

    getOutbreaks()
      .then(d => setOutbreaks(d))
      .catch(() => setOutbreaks(null))
      .finally(() => setOutbreaksLoading(false))

    getHeatmap()
      .then(d => setHeatmapData(d))
      .catch(() => setHeatmapData(null))
      .finally(() => setHeatmapLoading(false))

    getTreatmentEffectiveness()
      .then(d => setTreatments(d))
      .catch(() => setTreatments(null))
      .finally(() => setTreatmentsLoading(false))
  }, [])

  // ── Fetch cases (filtered + paginated) ──
  const fetchCases = useCallback(() => {
    setCasesLoading(true)
    getCases({
      page: casePage,
      limit: 8,
      crop: filterCrop || undefined,
      severity: filterSeverity || undefined,
      region: filterRegion || undefined,
      startDate: filterStartDate || undefined,
      endDate: filterEndDate || undefined,
    })
      .then(d => setCasesData(d))
      .catch(() => setCasesData(null))
      .finally(() => setCasesLoading(false))
  }, [casePage, filterCrop, filterSeverity, filterRegion, filterStartDate, filterEndDate])

  useEffect(() => {
    fetchCases()
  }, [fetchCases])

  // Reset page when filters change
  function handleFilterChange(setter) {
    return (e) => {
      setter(e.target.value)
      setCasePage(1)
    }
  }

  return (
    <div className="dashboard-view" id="disease-analytics-page">
      <section className="dashboard-content" style={{ maxWidth: 1200 }}>

        {/* ── Page Header ── */}
        <div className="da-header">
          <div className="da-header-left">
            <h1>Disease & Pest Analytics</h1>
            <p>Analyze outbreak patterns, risk heat-maps, and treatment effectiveness across all fields.</p>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="da-stats-grid" id="da-stat-cards">
          <StatCard
            title="Active Cases"
            value={overview?.activeCases}
            loading={overviewLoading}
            icon="🔬"
            accent="#dc2626"
          />
          <StatCard
            title="Affected Acreage"
            value={overview?.totalAffectedAcreage ? `${overview.totalAffectedAcreage} ac` : null}
            loading={overviewLoading}
            icon="🌾"
            accent="#f97316"
          />
          <StatCard
            title="Avg Health Score"
            value={overview?.avgHealthScore ? `${overview.avgHealthScore}/100` : null}
            loading={overviewLoading}
            icon="💚"
            accent="var(--accent-green)"
          />
          <StatCard
            title="Est. Economic Loss"
            value={overview?.totalEstEconomicLoss ? `₹${(overview.totalEstEconomicLoss / 1000).toFixed(0)}K` : null}
            loading={overviewLoading}
            icon="💰"
            accent="#7c3aed"
          />
        </div>

        {/* ── Filter Bar ── */}
        <div className="da-filters" id="da-filter-bar">
          <select
            className="da-filter-select"
            value={filterCrop}
            onChange={handleFilterChange(setFilterCrop)}
            id="filter-crop"
          >
            <option value="">All Crops</option>
            {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            className="da-filter-select"
            value={filterSeverity}
            onChange={handleFilterChange(setFilterSeverity)}
            id="filter-severity"
          >
            <option value="">All Severities</option>
            {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            type="date"
            className="da-filter-input"
            value={filterStartDate}
            onChange={handleFilterChange(setFilterStartDate)}
            id="filter-start-date"
          />
          <input
            type="date"
            className="da-filter-input"
            value={filterEndDate}
            onChange={handleFilterChange(setFilterEndDate)}
            id="filter-end-date"
          />
          <div className="da-search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              className="da-search-input"
              placeholder="Search region / field…"
              value={filterRegion}
              onChange={handleFilterChange(setFilterRegion)}
              id="filter-region"
            />
          </div>
        </div>

        {/* ── Outbreak Patterns ── */}
        <OutbreakPatterns data={outbreaks} loading={outbreaksLoading} />

        {/* ── Risk Heatmap ── */}
        <RiskHeatmap data={heatmapData} loading={heatmapLoading} />

        {/* ── Treatment Effectiveness ── */}
        <TreatmentTable data={treatments} loading={treatmentsLoading} />

        {/* ── Case List ── */}
        <CaseTable
          data={casesData}
          loading={casesLoading}
          page={casePage}
          totalPages={casesData?.totalPages || 1}
          onPageChange={setCasePage}
          onRowClick={setSelectedCaseId}
        />

      </section>

      {/* ── Case Detail Drawer ── */}
      {selectedCaseId && (
        <CaseDetailDrawer
          detectionId={selectedCaseId}
          onClose={() => setSelectedCaseId(null)}
        />
      )}
    </div>
  )
}

/* ===== Stat Card (reuses existing admin stat card styling) ===== */
function StatCard({ title, value, loading, icon, accent }) {
  return (
    <div className="da-stat-card">
      <div className="da-stat-icon" style={{ background: `${accent}12`, color: accent }}>
        {icon}
      </div>
      <div className="da-stat-info">
        <span className="da-stat-label">{title}</span>
        {loading ? (
          <div className="da-skeleton da-skeleton--value" />
        ) : (
          <span className="da-stat-value">{value ?? '—'}</span>
        )}
      </div>
    </div>
  )
}
