/**
 * Maps risk titles to AI weatherRisks field names.
 */
const TITLE_TO_AI_FIELD = {
  'Heavy Rain Risk': 'heavyRainRisk',
  'Flood Risk': 'floodRisk',
  'Strong Wind Risk': 'strongWindRisk',
  'Heatwave Risk': 'heatwaveRisk',
  'Cold Stress': 'coldStress',
  'UV Exposure': 'uvExposure',
}

export function WeatherRisks({ risks, aiData, aiLoading }) {
  return (
    <section className="weather-section">
      <div className="section-heading-row">
        <h2>Weather Risk Indicators</h2>
        <span>Probability and risk levels for critical farming events</span>
      </div>
      <div className="risks-grid">
        {risks.map((risk) => {
          const aiField = TITLE_TO_AI_FIELD[risk.title]
          const aiRisk = aiData?.weatherRisks?.[aiField]
          const explanation = aiRisk?.explanation || ''

          return (
            <article key={risk.title} className={`risk-card glass-card ${risk.colorClass}`}>
              <span className="risk-title">{risk.title}</span>
              <strong className="risk-value">{risk.value}</strong>
              <span className="risk-level">{risk.level}</span>
              {aiLoading && !explanation ? (
                <div className="ai-shimmer-inline ai-shimmer-on-dark" />
              ) : explanation ? (
                <p className="risk-explanation">{explanation}</p>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
