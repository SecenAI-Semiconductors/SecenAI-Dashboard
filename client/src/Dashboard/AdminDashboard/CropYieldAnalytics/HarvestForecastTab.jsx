/**
 * HarvestForecastTab.jsx — Harvest Forecast tab
 *
 * Sortable table of in-progress, unharvested records.
 * Upcoming-harvest timeline: counts grouped by week for ~8 weeks.
 */

import { useState, useMemo } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { REFERENCE_DATE, CHART_COLORS, formatNumber } from './utils'
import { CyaTooltip, StatusBadge, ConfidenceBadge, SortIcon, EmptyState } from './CropYieldAnalytics'

export function HarvestForecastTab({ data }) {
  const [sortKey, setSortKey] = useState('harvestDate')
  const [sortDir, setSortDir] = useState('asc')

  // ── Only in-progress, unharvested records ──
  const forecasts = useMemo(() => {
    return data.filter(r => r.stage !== 'harvested' && r.forecastYield != null)
  }, [data])

  // ── Sort ──
  const sorted = useMemo(() => {
    return [...forecasts].sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey]
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      return sortDir === 'asc'
        ? (typeof va === 'string' ? va.localeCompare(vb) : va - vb)
        : (typeof va === 'string' ? vb.localeCompare(va) : vb - va)
    })
  }, [forecasts, sortKey, sortDir])

  // ── Upcoming-harvest timeline (8 weeks from REFERENCE_DATE) ──
  const timelineData = useMemo(() => {
    const refMs = REFERENCE_DATE.getTime()
    const msPerWeek = 7 * 24 * 60 * 60 * 1000
    const weeks = []

    for (let i = 0; i < 8; i++) {
      const weekStart = new Date(refMs + i * msPerWeek)
      const weekEnd = new Date(refMs + (i + 1) * msPerWeek)
      const label = `${weekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`
      weeks.push({ week: `Wk ${i + 1}`, label, count: 0, startMs: weekStart.getTime(), endMs: weekEnd.getTime() })
    }

    for (const r of forecasts) {
      const hMs = new Date(r.harvestDate).getTime()
      for (const w of weeks) {
        if (hMs >= w.startMs && hMs < w.endMs) { w.count++; break }
      }
    }

    return weeks.map(w => ({ week: `${w.week}\n${w.label}`, count: w.count }))
  }, [forecasts])

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const TH = ({ label, field }) => (
    <th className="cya-th-sortable" onClick={() => handleSort(field)}>
      <span className="cya-th-sort-content">{label} <SortIcon active={sortKey === field} dir={sortDir} /></span>
    </th>
  )

  if (forecasts.length === 0) return <EmptyState />

  return (
    <>
      {/* ── Forecast Table ── */}
      <div className="cya-card">
        <h3 className="cya-section-title">Harvest Forecasts</h3>
        <p className="cya-section-subtitle">{forecasts.length} in-progress records with forecast data</p>
        <div className="cya-table-container">
          <table className="cya-table" id="cya-forecast-table">
            <thead>
              <tr>
                <TH label="Crop" field="crop" />
                <TH label="Farmer" field="farmerName" />
                <TH label="Plot" field="plotName" />
                <TH label="Exp. Harvest" field="harvestDate" />
                <TH label="Stage" field="stage" />
                <TH label="Forecast Qty" field="production" />
                <TH label="Forecast Yield" field="forecastYield" />
                <th>Confidence</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(r => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 500 }}>{r.crop}</td>
                  <td>{r.farmerName}</td>
                  <td>{r.plotName}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{r.harvestDate}</td>
                  <td style={{ textTransform: 'capitalize' }}>{r.stage}</td>
                  <td>{formatNumber(r.production, 1)} t</td>
                  <td>{r.forecastYield.toFixed(2)} t/ac</td>
                  <td>{r.confidence && <ConfidenceBadge confidence={r.confidence} />}</td>
                  <td><StatusBadge status={r.status} isProjected={r.isProjected} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Upcoming Harvest Timeline ── */}
      <div className="cya-card">
        <h3 className="cya-section-title">Upcoming Harvest Timeline</h3>
        <p className="cya-section-subtitle">Expected harvests in the next 8 weeks</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={timelineData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: CHART_COLORS.axis }} tickLine={false} interval={0} />
            <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
            <Tooltip content={<CyaTooltip unit="plots" />} />
            <Bar dataKey="count" fill={CHART_COLORS.teal} radius={[4, 4, 0, 0]} name="Harvests" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
