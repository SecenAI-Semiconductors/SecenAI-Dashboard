export function OutbreakPatterns({ data, loading }) {
  if (loading) {
    return (
      <div className="da-card">
        <h2 className="da-section-title">Outbreak Patterns</h2>
        <div className="da-outbreak-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="da-skeleton da-skeleton--card" />
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="da-card">
        <h2 className="da-section-title">Outbreak Patterns</h2>
        <div className="da-empty">No outbreak data available.</div>
      </div>
    )
  }

  return (
    <div className="da-card">
      <h2 className="da-section-title">Outbreak Patterns</h2>
      <p className="da-section-subtitle">Disease groups detected across fields</p>
      <div className="da-outbreak-grid">
        {data.map((o) => (
          <div key={o.disease} className="da-outbreak-card" id={`outbreak-${o.disease.replace(/\s+/g, '-').toLowerCase()}`}>
            <div className="da-outbreak-header">
              <h3 className="da-outbreak-name">{o.disease}</h3>
              <span className={`da-trend-badge da-trend-badge--${o.trend}`}>
                {o.trend === 'up' ? '↑' : o.trend === 'down' ? '↓' : '→'}{' '}
                {o.avgSpreadRatePct}%
              </span>
            </div>
            <div className="da-outbreak-stats">
              <div className="da-outbreak-stat">
                <span className="da-outbreak-stat-value">{o.fieldCount}</span>
                <span className="da-outbreak-stat-label">Fields</span>
              </div>
              <div className="da-outbreak-stat">
                <span className="da-outbreak-stat-value">{o.totalAffectedAcreage}</span>
                <span className="da-outbreak-stat-label">Acres</span>
              </div>
              <div className="da-outbreak-stat">
                <span className="da-outbreak-stat-value">{o.avgHealthScore}</span>
                <span className="da-outbreak-stat-label">Avg Health</span>
              </div>
            </div>
            <div className="da-outbreak-date">
              First detected: {new Date(o.firstDetected).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
