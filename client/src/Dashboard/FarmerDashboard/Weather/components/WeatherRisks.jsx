export function WeatherRisks({ risks }) {
  return (
    <section className="weather-section">
      <div className="section-heading-row">
        <h2>Weather Risk Indicators</h2>
        <span>Probability and risk levels for critical farming events</span>
      </div>
      <div className="risks-grid">
        {risks.map((risk) => (
          <article key={risk.title} className={`risk-card glass-card ${risk.colorClass}`}>
            <span className="risk-title">{risk.title}</span>
            <strong className="risk-value">{risk.value}</strong>
            <span className="risk-level">{risk.level}</span>
          </article>
        ))}
      </div>
    </section>
  )
}
