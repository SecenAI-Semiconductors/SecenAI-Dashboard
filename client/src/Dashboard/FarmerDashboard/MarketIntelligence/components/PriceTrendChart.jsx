/**
 * PriceTrendChart.jsx
 *
 * Recharts AreaChart for modal price over time.
 * Uses CSS classes from MarketIntelligence.css.
 */

import { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

const TIME_RANGES = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: 'all', label: 'All' },
]

function filterByRange(data, range) {
  if (range === 'all' || data.length === 0) return data
  const days = range === '7d' ? 7 : 30
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().slice(0, 10)
  return data.filter((d) => d.date >= cutoffStr)
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="ptc-tooltip">
      <div className="ptc-tooltip-date">{d.displayDate}</div>
      {d.market && (
        <div className="ptc-tooltip-row">
          <span className="ptc-tooltip-label">Market</span>
          <span className="ptc-tooltip-market">{d.market}</span>
        </div>
      )}
      <div className="ptc-tooltip-row">
        <span className="ptc-tooltip-label">Modal Price</span>
        <span className="ptc-tooltip-value">
          ₹{Number(d.modalPrice).toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  )
}

export function PriceTrendChart({ chartData }) {
  const [range, setRange] = useState('all')

  const filteredData = useMemo(
    () => filterByRange(chartData, range),
    [chartData, range],
  )

  const isEmpty = !filteredData || filteredData.length === 0

  return (
    <section className="mi-section" id="price-trend-section">
      <div className="mi-section-header">
        <span className="mi-section-icon">📈</span>
        <h2 className="mi-section-title">Price Trend</h2>
      </div>
      <p className="mi-section-subtitle">
        Modal price movement over time across available markets.
      </p>

      <div className="ptc-card">
        {/* Header with range buttons */}
        <div className="ptc-header">
          <span className="ptc-header-title">Modal Price (₹/Qt)</span>
          <div className="ptc-range-btns">
            {TIME_RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={`ptc-range-btn${range === r.key ? ' ptc-range-btn--active' : ''}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart body */}
        <div className="ptc-body">
          {isEmpty ? (
            <div className="ptc-empty">
              <div className="ptc-empty-icon">📊</div>
              <span className="ptc-empty-text">
                No price trend data available for this period.
              </span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2e9e50" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#2e9e50" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,120,60,0.06)" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 11, fill: '#8a9a8a' }}
                  axisLine={{ stroke: 'rgba(34,120,60,0.10)' }}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#8a9a8a' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                  dx={-4}
                  width={72}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="modalPrice"
                  stroke="#2e9e50"
                  strokeWidth={2.5}
                  fill="url(#priceGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#2e9e50', stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={1200}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  )
}
