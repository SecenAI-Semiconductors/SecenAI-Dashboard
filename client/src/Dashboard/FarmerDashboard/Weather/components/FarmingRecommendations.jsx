export function FarmingRecommendations({ recommendations }) {
  return (
    <section className="weather-section">
      <div className="section-heading-row">
        <h2>Farming Recommendations</h2>
        <span>Actionable guidance based on today’s weather</span>
      </div>
      <div className="recommendations-grid">
        {recommendations.map((item) => (
          <article key={item.title} className="recommendation-card glass-card">
            <span className="recommendation-title">{item.title}</span>
            <p>{item.note}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
