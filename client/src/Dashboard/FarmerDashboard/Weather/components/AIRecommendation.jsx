export function AIRecommendation() {
  return (
    <section className="weather-section">
      <div className="section-heading-row">
        <h2>AI Recommendation</h2>
        <span>Premium advisory note for farm planning</span>
      </div>
      <article className="ai-card glass-card">
        <div className="ai-card-header">
          <h3>Current weather conditions are favorable for irrigation during the early morning.</h3>
          <span className="ai-confidence">Confidence 91%</span>
        </div>
        <div className="ai-card-body">
          <p>No significant rainfall is expected today.</p>
          <p>Avoid pesticide spraying if wind speed increases beyond 20 km/h.</p>
          <p>Monitor UV exposure for sensitive crops after midday.</p>
        </div>
      </article>
    </section>
  )
}
