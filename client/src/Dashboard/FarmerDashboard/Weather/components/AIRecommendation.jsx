export function AIRecommendation({ aiData, aiLoading, aiError }) {
  // Loading state — shimmer skeleton matching existing pattern
  if (aiLoading) {
    return (
      <section className="weather-section">
        <div className="section-heading-row">
          <h2>AI Recommendation</h2>
          <span>Premium advisory note for farm planning</span>
        </div>
        <article className="ai-card glass-card">
          <div className="ai-shimmer-block" />
          <div className="ai-shimmer-block ai-shimmer-short" />
          <div className="ai-shimmer-block ai-shimmer-medium" />
        </article>
      </section>
    )
  }

  // Error or unavailable state
  if (aiError || !aiData?.aiRecommendation) {
    return (
      <section className="weather-section">
        <div className="section-heading-row">
          <h2>AI Recommendation</h2>
          <span>Premium advisory note for farm planning</span>
        </div>
        <article className="ai-card glass-card">
          <div className="ai-unavailable-banner">
            <span className="ai-unavailable-icon">ℹ️</span>
            <p>{aiError || 'AI analysis is temporarily unavailable. Current weather data is still available.'}</p>
          </div>
        </article>
      </section>
    )
  }

  const rec = aiData.aiRecommendation

  return (
    <section className="weather-section">
      <div className="section-heading-row">
        <h2>AI Recommendation</h2>
        <span>Premium advisory note for farm planning</span>
      </div>
      <article className="ai-card glass-card">
        <div className="ai-card-header">
          <h3>{rec.headline}</h3>
          <span className="ai-confidence">{rec.priority} Priority</span>
        </div>
        <div className="ai-card-body">
          <p>{rec.summary}</p>
          {rec.recommendations.length > 0 && (
            <ul className="ai-rec-list">
              {rec.recommendations.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          {rec.warnings.length > 0 && (
            <div className="ai-warnings">
              {rec.warnings.map((warning, i) => (
                <p key={i} className="ai-warning-item">⚠️ {warning}</p>
              ))}
            </div>
          )}
        </div>
      </article>
    </section>
  )
}
