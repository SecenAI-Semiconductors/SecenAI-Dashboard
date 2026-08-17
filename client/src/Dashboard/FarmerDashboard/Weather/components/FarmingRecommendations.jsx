/**
 * Maps recommendation titles to AI farmingRecommendations field names.
 */
const TITLE_TO_AI_FIELD = {
  'Recommended Irrigation Time': 'irrigation',
  'Suitable Fertilizer Window': 'fertilizer',
  'Pesticide Spray Recommendation': 'pesticideSpraying',
  'Harvest Suitability': 'harvesting',
  'Field Work Recommendation': 'fieldWork',
}

export function FarmingRecommendations({ recommendations, aiData, aiLoading, aiError }) {
  const hasAiData = aiData?.farmingRecommendations && Object.keys(aiData.farmingRecommendations).length > 0

  return (
    <section className="weather-section">
      <div className="section-heading-row">
        <h2>Farming Recommendations</h2>
        <span>Actionable guidance based on today's weather</span>
      </div>
      {/* Show unavailable banner when AI failed and we have no AI data */}
      {!aiLoading && !hasAiData && aiError && (
        <div className="ai-unavailable-banner ai-section-banner">
          <span className="ai-unavailable-icon">ℹ️</span>
          <p>AI-enhanced recommendations are unavailable. Showing standard weather-based guidance.</p>
        </div>
      )}
      <div className="recommendations-grid">
        {recommendations.map((item) => {
          const aiField = TITLE_TO_AI_FIELD[item.title]
          const aiNote = aiField ? aiData?.farmingRecommendations?.[aiField] : null

          return (
            <article key={item.title} className="recommendation-card glass-card">
              <span className="recommendation-title">{item.title}</span>
              {aiLoading && !aiNote ? (
                <div className="ai-shimmer-inline" />
              ) : (
                <p>{aiNote || item.note}</p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
