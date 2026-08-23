/**
 * Maps AI agricultural analysis fields to existing indicator titles.
 */
const AI_FIELD_TO_TITLE = {
  cropGrowthConditions: 'Crop Growth Conditions',
  heatStress: 'Heat Stress',
  rainfallSuitability: 'Rainfall Suitability',
  windImpact: 'Wind Impact',
  irrigationNeed: 'Irrigation Need',
  soilMoistureExpectation: 'Soil Moisture Expectation',
}

export function AgricultureAnalysis({ indicators, aiData, aiLoading, aiError }) {
  // Build a lookup from AI data keyed by title
  const aiLookup = {}
  if (aiData?.agriculturalAnalysis) {
    for (const [key, value] of Object.entries(aiData.agriculturalAnalysis)) {
      const title = AI_FIELD_TO_TITLE[key]
      if (title && value) {
        aiLookup[title] = value
      }
    }
  }

  const hasAiData = Object.keys(aiLookup).length > 0

  return (
    <section className="weather-section">
      <div className="section-heading-row">
        <h2>Agricultural Weather Analysis</h2>
        <span>Farming-specific recommendations from weather trends</span>
      </div>
      {/* Show unavailable banner when AI failed and we have no AI data */}
      {!aiLoading && !hasAiData && aiError && (
        <div className="ai-unavailable-banner ai-section-banner">
          <span className="ai-unavailable-icon">ℹ️</span>
          <p>AI-enhanced analysis is unavailable. Showing standard weather-based indicators.</p>
        </div>
      )}
      <div className="agriculture-grid">
        {indicators.map((item) => {
          const aiItem = aiLookup[item.title]
          const label = aiItem ? aiItem.status : item.label
          const note = aiItem ? aiItem.explanation : item.note

          return (
            <article key={item.title} className="agri-card glass-card">
              <div className="agri-card-title-row">
                <span className="agri-icon">🌾</span>
                <span className="agri-title">{item.title}</span>
              </div>
              <strong className="agri-label">{label}</strong>
              {aiLoading && !aiItem ? (
                <div className="ai-shimmer-inline" />
              ) : (
                <p className="agri-note">{note}</p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
