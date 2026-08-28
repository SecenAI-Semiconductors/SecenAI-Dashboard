export function NutrientRecommendations({ recs }) {
  // Only show recommendations for nutrients that need action
  const actionableRecs = recs.filter(r => r.action.includes('Increase'))

  if (actionableRecs.length === 0) return null

  return (
    <section className="si-section glass-card si-nutrient-recs-section">
      <div className="si-section-header">
        <span className="si-section-icon">💡</span>
        <h2>Nutrient Recommendations</h2>
      </div>
      
      <div className="si-recs-list">
        {actionableRecs.map((rec, i) => (
          <div key={i} className="si-rec-item">
            <div className="si-rec-header">
              <h4>{rec.nutrient} Deficiency</h4>
            </div>
            <p className="si-rec-desc">
              {rec.nutrient} levels are below the recommended range.
            </p>
            <div className="si-rec-action-box">
              <span className="si-rec-action-label">Recommendation:</span>
              <p>{rec.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
