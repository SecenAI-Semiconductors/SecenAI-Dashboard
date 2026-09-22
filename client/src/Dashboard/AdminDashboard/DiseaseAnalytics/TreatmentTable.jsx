import { useState } from 'react'

export function TreatmentTable({ data, loading }) {
  const [sortKey, setSortKey] = useState('avgHealthScoreDelta')
  const [sortDir, setSortDir] = useState('desc')

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = data ? [...data].sort((a, b) => {
    const diff = (a[sortKey] || 0) - (b[sortKey] || 0)
    return sortDir === 'asc' ? diff : -diff
  }) : []

  if (loading) {
    return (
      <div className="da-card">
        <h2 className="da-section-title">Treatment Effectiveness</h2>
        <div className="da-table-container">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="da-skeleton-row">
              <div className="da-skeleton da-skeleton--text" />
              <div className="da-skeleton da-skeleton--short" />
              <div className="da-skeleton da-skeleton--short" />
              <div className="da-skeleton da-skeleton--short" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="da-card">
        <h2 className="da-section-title">Treatment Effectiveness</h2>
        <div className="da-empty">No treatment data available.</div>
      </div>
    )
  }

  const columns = [
    { key: 'product', label: 'Product', sortable: false },
    { key: 'casesApplied', label: 'Cases', sortable: true },
    { key: 'avgHealthScoreDelta', label: 'Avg Δ Health Score', sortable: true },
    { key: 'avgCost', label: 'Avg Cost (₹)', sortable: true },
    { key: 'avgRecoveryDays', label: 'Avg Recovery (days)', sortable: true },
  ]

  return (
    <div className="da-card">
      <h2 className="da-section-title">Treatment Effectiveness</h2>
      <p className="da-section-subtitle">Aggregated treatment outcomes across all cases</p>
      <div className="da-table-container">
        <table className="da-table" id="treatment-effectiveness-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={col.sortable ? 'da-th-sortable' : ''}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="da-th-content">
                    {col.label}
                    {col.sortable && (
                      <span className={`da-sort-icon${sortKey === col.key ? ' da-sort-icon--active' : ''}`}>
                        {sortKey === col.key && sortDir === 'asc' ? '▲' : sortKey === col.key && sortDir === 'desc' ? '▼' : '⇅'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => (
              <tr key={t.product}>
                <td className="da-td-product">{t.product}</td>
                <td>{t.casesApplied}</td>
                <td>
                  <span className="da-delta-badge">
                    +{t.avgHealthScoreDelta}
                  </span>
                </td>
                <td>₹{t.avgCost.toLocaleString('en-IN')}</td>
                <td>{t.avgRecoveryDays} days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
