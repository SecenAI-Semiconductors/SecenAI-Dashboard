export function FertilizerRecommendation({ recs }) {
  return (
    <section className="si-section glass-card si-fertilizer-section">
      <div className="si-section-header">
        <span className="si-section-icon">📦</span>
        <h2>Fertilizer Recommendation</h2>
      </div>
      <p className="si-section-subtitle">Based on your current soil NPK values.</p>
      
      <div className="si-fert-grid">
        {recs.map((rec, i) => (
          <div key={i} className="si-fert-item">
            <span className="si-fert-nutrient">{rec.nutrient}</span>
            <span className="si-fert-action">{rec.action}</span>
          </div>
        ))}
      </div>
      
      <div className="si-advisory-note">
        <span className="si-info-icon">ℹ️</span>
        <p>These recommendations are advisory. Please consult with a local agronomist before applying fertilizers.</p>
      </div>
    </section>
  )
}
