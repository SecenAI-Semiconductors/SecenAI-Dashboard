export function AISoilRecommendation({ aiRec }) {
  if (!aiRec) return null

  return (
    <section className="si-section si-ai-section">
      <div className="si-section-header">
        <span className="si-section-icon">🤖</span>
        <h2>AI Soil Recommendation</h2>
      </div>
      
      <article className="si-ai-card glass-card">
        <div className="si-ai-card-header">
          <h3>Farming Advisory</h3>
          <span className="si-ai-badge">AI Generated</span>
        </div>
        <div className="si-ai-card-body">
          <p className="si-ai-summary">{aiRec.summary}</p>
          <p className="si-ai-irrigation">{aiRec.irrigation}</p>
        </div>
      </article>
    </section>
  )
}
