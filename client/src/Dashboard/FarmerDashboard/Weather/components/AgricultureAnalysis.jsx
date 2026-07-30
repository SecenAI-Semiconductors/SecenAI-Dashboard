export function AgricultureAnalysis({ indicators }) {
  return (
    <section className="weather-section">
      <div className="section-heading-row">
        <h2>Agricultural Weather Analysis</h2>
        <span>Farming-specific recommendations from weather trends</span>
      </div>
      <div className="agriculture-grid">
        {indicators.map((item) => (
          <article key={item.title} className="agri-card glass-card">
            <div className="agri-card-title-row">
              <span className="agri-icon">🌾</span>
              <span className="agri-title">{item.title}</span>
            </div>
            <strong className="agri-label">{item.label}</strong>
            <p className="agri-note">{item.note}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
