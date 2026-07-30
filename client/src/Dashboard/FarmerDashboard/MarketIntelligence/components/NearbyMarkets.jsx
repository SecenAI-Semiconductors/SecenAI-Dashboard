/**
 * NearbyMarkets.jsx
 *
 * Displays the first 10 markets filtered by state (temporary until
 * user location is implemented). Includes local filters.
 */

import { useState, useMemo, useCallback } from 'react'
import { Filters } from './Filters'

function formatPrice(val) {
  const n = Number(val)
  if (!Number.isFinite(n)) return '—'
  return `₹${n.toLocaleString('en-IN')}`
}

const FILTER_FIELDS = [
  { key: 'commodity', label: 'Commodity', placeholder: 'e.g. Wheat' },
  { key: 'state', label: 'State', placeholder: 'e.g. Maharashtra' },
  { key: 'district', label: 'District', placeholder: 'e.g. Pune' },
]

export function NearbyMarkets({ records }) {
  const [localFilters, setLocalFilters] = useState({
    commodity: '',
    state: '',
    district: '',
  })

  const handleFilter = useCallback((filters) => {
    setLocalFilters(filters)
  }, [])

  const filteredMarkets = useMemo(() => {
    let data = records || []

    if (localFilters.commodity.trim()) {
      data = data.filter((r) =>
        r.commodity.toLowerCase().includes(localFilters.commodity.toLowerCase()),
      )
    }
    if (localFilters.state.trim()) {
      data = data.filter((r) =>
        r.state.toLowerCase().includes(localFilters.state.toLowerCase()),
      )
    }
    if (localFilters.district.trim()) {
      data = data.filter((r) =>
        r.district.toLowerCase().includes(localFilters.district.toLowerCase()),
      )
    }

    return data.slice(0, 10)
  }, [records, localFilters])

  const isEmpty = filteredMarkets.length === 0

  return (
    <section className="mi-section" id="nearby-markets-section">
      <div className="mi-section-header">
        <span className="mi-section-icon">📍</span>
        <h2 className="mi-section-title">Nearby Markets</h2>
      </div>
      <p className="mi-section-subtitle">
        Markets in your region. Location-based filtering coming soon.
      </p>

      <Filters fields={FILTER_FIELDS} onFilter={handleFilter} compact />

      <div className="mi-table-card">
        {isEmpty ? (
          <div className="mi-empty-state">
            <div className="mi-empty-icon">🔍</div>
            <span className="mi-empty-title">No market data available.</span>
            <span className="mi-empty-msg">Try changing your filters.</span>
          </div>
        ) : (
          <div className="mi-table-wrap">
            <table className="mi-table">
              <thead>
                <tr>
                  <th>Market</th>
                  <th>District</th>
                  <th className="mi-table-th--right">Modal Price</th>
                  <th className="mi-table-th--right">Min Price</th>
                  <th className="mi-table-th--right">Max Price</th>
                  <th>Arrival Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarkets.map((r, i) => (
                  <tr key={`${r.market}-${r.district}-${i}`}>
                    <td className="mi-table-commodity">{r.market}</td>
                    <td>{r.district}</td>
                    <td className="mi-table-price--modal mi-table-cell--right">
                      {formatPrice(r.modalPrice)}
                    </td>
                    <td className="mi-table-price--min mi-table-cell--right">
                      {formatPrice(r.minPrice)}
                    </td>
                    <td className="mi-table-price--max mi-table-cell--right">
                      {formatPrice(r.maxPrice)}
                    </td>
                    <td className="mi-table-date">{r.arrivalDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
