/**
 * CropPerformanceTab.jsx — Crop Performance tab
 *
 * Sortable table + crop yield comparison bar + seasonal yield trend line.
 * All data comes from the enriched, filtered set passed as props.
 */

import { useState, useMemo } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { computeCropPerformance, computeSeasonalTrend, SEASONS } from './api'
import { CHART_COLORS, formatNumber, formatPercent } from './utils'
import { CyaTooltip, StatusBadge, SortIcon, EmptyState } from './CropYieldAnalytics'

export function CropPerformanceTab({ data, allData, filterSeason }) {
  const [sortKey, setSortKey] = useState('crop')
  const [sortDir, setSortDir] = useState('asc')

  const rows = useMemo(() => {
    const perf = computeCropPerformance(data, allData, filterSeason)
    return [...perf].sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey]
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      return sortDir === 'asc'
        ? (typeof va === 'string' ? va.localeCompare(vb) : va - vb)
        : (typeof va === 'string' ? vb.localeCompare(va) : vb - va)
    })
  }, [data, allData, filterSeason, sortKey, sortDir])

  // ── Crop yield comparison bar (Actual Yield, Expected Yield, Benchmark) ──
  const compBarData = useMemo(() =>
    rows.map(r => ({
      crop: r.crop.replace(' (Paddy)', '').replace(' (Tur)', ''),
      'Actual Yield': r.actualYield,
      'Expected Yield': r.expectedYield,
      Benchmark: r.benchmark,
    })), [rows])

  // ── Seasonal yield trend (per crop, harvested only) ──
  const trendData = useMemo(() => {
    const raw = computeSeasonalTrend(allData)
    // Pivot: { season, [crop]: avgYield }
    const bySeason = {}
    for (const d of raw) {
      if (!bySeason[d.season]) bySeason[d.season] = { season: d.season }
      bySeason[d.season][d.crop] = d.avgYield
    }
    return SEASONS.map(s => bySeason[s.name] || { season: s.name })
  }, [allData])

  const cropNames = useMemo(() => [...new Set(rows.map(r => r.crop))], [rows])

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const TH = ({ label, field }) => (
    <th className="cya-th-sortable" onClick={() => handleSort(field)}>
      <span className="cya-th-sort-content">{label} <SortIcon active={sortKey === field} dir={sortDir} /></span>
    </th>
  )

  if (rows.length === 0) return <EmptyState />

  return (
    <>
      {/* ── Table ── */}
      <div className="cya-card">
        <h3 className="cya-section-title">Crop Performance</h3>
        <p className="cya-section-subtitle">Aggregated metrics per crop from filtered data</p>
        <div className="cya-table-container">
          <table className="cya-table" id="cya-crop-table">
            <thead>
              <tr>
                <TH label="Crop" field="crop" />
                <TH label="Area (ac)" field="area" />
                <TH label="Exp Yield" field="expectedYield" />
                <TH label="Act Yield" field="actualYield" />
                <TH label="Yield/Acre" field="yieldPerAcre" />
                <TH label="Prev Season" field="prevSeasonYield" />
                <TH label="Growth %" field="growthPct" />
                <TH label="Variance" field="variancePct" />
                <TH label="Benchmark" field="benchmark" />
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.crop}>
                  <td style={{ fontWeight: 500 }}>{r.crop}</td>
                  <td>{formatNumber(r.area, 1)}</td>
                  <td>{r.expectedYield != null ? r.expectedYield.toFixed(2) : '—'}</td>
                  <td>{r.actualYield != null ? r.actualYield.toFixed(2) : '—'}</td>
                  <td>{r.yieldPerAcre != null ? r.yieldPerAcre.toFixed(2) : '—'}</td>
                  <td>{r.prevSeasonYield != null ? r.prevSeasonYield.toFixed(2) : '—'}</td>
                  <td>{r.growthPct != null ? formatPercent(r.growthPct) : '—'}</td>
                  <td>{r.variancePct != null ? formatPercent(r.variancePct) : '—'}</td>
                  <td>{r.benchmark != null ? r.benchmark.toFixed(2) : '—'}</td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="cya-charts-row">
        <div className="cya-card">
          <h3 className="cya-section-title">Crop Yield Comparison</h3>
          <p className="cya-section-subtitle">Actual vs expected yield per acre with regional benchmark</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={compBarData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis dataKey="crop" tick={{ fontSize: 10, fill: CHART_COLORS.axis }} tickLine={false} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} width={50} />
              <Tooltip content={<CyaTooltip unit="t/ac" />} />
              <Bar dataKey="Expected Yield" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Actual Yield" fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Benchmark" fill={CHART_COLORS.gold} radius={[4, 4, 0, 0]} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="cya-card">
          <h3 className="cya-section-title">Seasonal Yield Trend</h3>
          <p className="cya-section-subtitle">Average yield/acre by season (harvested only)</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis dataKey="season" tick={{ fontSize: 11, fill: CHART_COLORS.axis }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} width={50} />
              <Tooltip content={<CyaTooltip unit="t/ac" />} />
              {cropNames.map((crop, i) => (
                <Line key={crop} type="monotone" dataKey={crop} stroke={CHART_COLORS.series[i % CHART_COLORS.series.length]}
                  strokeWidth={2} dot={{ r: 3 }} connectNulls />
              ))}
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}
