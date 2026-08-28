export function SoilHealthAnalysis({ health }) {
  return (
    <section className="si-section glass-card si-health-section">
      <div className="si-section-header">
        <span className="si-section-icon">🩺</span>
        <h2>Soil Health Analysis</h2>
      </div>
      
      <div className="si-health-content">
        <div className="si-health-summary">
          <p>Overall Soil Condition: <strong>{health.condition}</strong></p>
          <p className="si-health-score-text">Score: {Math.round(health.score)} / 100</p>
        </div>

        <div className="si-health-lists">
          {health.good.length > 0 && (
            <div className="si-health-list si-health-good">
              <h4>Strengths</h4>
              <ul>
                {health.good.map((item, i) => (
                  <li key={i}><span className="si-check">✓</span> {item}</li>
                ))}
              </ul>
            </div>
          )}

          {health.issues.length > 0 && (
            <div className="si-health-list si-health-issues">
              <h4>Areas for Improvement</h4>
              <ul>
                {health.issues.map((item, i) => (
                  <li key={i}><span className="si-warn">⚠</span> {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
