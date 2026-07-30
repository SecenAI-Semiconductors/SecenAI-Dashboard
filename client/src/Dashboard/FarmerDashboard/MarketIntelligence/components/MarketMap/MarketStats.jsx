/**
 * MarketStats.jsx
 *
 * Statistics bar displayed above the map.
 * Shows: Number of Markets, Highest Price, Lowest Price,
 * Average Modal Price, Best Market Name.
 */

import { useMemo } from 'react'

function formatPrice(val) {
  const n = Number(val)
  if (!Number.isFinite(n) || n === 0) return '—'
  return `₹${n.toLocaleString('en-IN')}`
}

export function MarketStats({ markets }) {
  const stats = useMemo(() => {
    if (!markets || markets.length === 0) {
      return {
        count: 0,
        highest: 0,
        lowest: 0,
        average: 0,
        bestMarket: '—',
      }
    }

    let highest = -Infinity
    let lowest = Infinity
    let sum = 0
    let validCount = 0
    let bestMarket = '—'

    for (const m of markets) {
      const price = Number(m.modalPrice)
      if (!Number.isFinite(price) || price === 0) continue

      if (price > highest) {
        highest = price
        bestMarket = m.market
      }
      if (price < lowest) {
        lowest = price
      }
      sum += price
      validCount++
    }

    return {
      count: markets.length,
      highest: highest === -Infinity ? 0 : highest,
      lowest: lowest === Infinity ? 0 : lowest,
      average: validCount > 0 ? Math.round(sum / validCount) : 0,
      bestMarket,
    }
  }, [markets])

  return (
    <div className="mm-stats-bar" id="market-map-stats">
      <div className="mm-stat-card">
        <div className="mm-stat-icon mm-stat-icon--markets">🏪</div>
        <div className="mm-stat-text">
          <span className="mm-stat-label">Markets</span>
          <span className="mm-stat-value">{stats.count}</span>
        </div>
      </div>

      <div className="mm-stat-card">
        <div className="mm-stat-icon mm-stat-icon--high">📈</div>
        <div className="mm-stat-text">
          <span className="mm-stat-label">Highest Price</span>
          <span className="mm-stat-value mm-stat-value--green">
            {formatPrice(stats.highest)}
          </span>
        </div>
      </div>

      <div className="mm-stat-card">
        <div className="mm-stat-icon mm-stat-icon--low">📉</div>
        <div className="mm-stat-text">
          <span className="mm-stat-label">Lowest Price</span>
          <span className="mm-stat-value mm-stat-value--red">
            {formatPrice(stats.lowest)}
          </span>
        </div>
      </div>

      <div className="mm-stat-card">
        <div className="mm-stat-icon mm-stat-icon--avg">📊</div>
        <div className="mm-stat-text">
          <span className="mm-stat-label">Avg Modal Price</span>
          <span className="mm-stat-value">{formatPrice(stats.average)}</span>
        </div>
      </div>

      <div className="mm-stat-card">
        <div className="mm-stat-icon mm-stat-icon--best">⭐</div>
        <div className="mm-stat-text">
          <span className="mm-stat-label">Best Market</span>
          <span className="mm-stat-value mm-stat-value--gold">
            {stats.bestMarket}
          </span>
        </div>
      </div>
    </div>
  )
}
