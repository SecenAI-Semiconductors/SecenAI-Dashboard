export function WeatherAnalysis({ summary }) {
  const cards = [
    { title: 'Highest Temperature Today', value: `${summary.highestTemperature}°C` },
    { title: 'Lowest Temperature Today', value: `${summary.lowestTemperature}°C` },
    { title: 'Average Humidity', value: `${summary.avgHumidity}%` },
    { title: 'Highest Wind Speed', value: `${summary.highestWindSpeed} km/h` },
    { title: 'Expected Rainfall', value: `${summary.expectedRainfall} mm` },
    { title: 'UV Risk Level', value: summary.uvRisk },
  ]

  return (
    <section className="weather-section">
      <div className="section-heading-row">
        <h2>Weather Analysis</h2>
        <span>Dynamic insights from today’s forecast</span>
      </div>
      <div className="analysis-grid">
        {cards.map((card) => (
          <article key={card.title} className="analysis-card glass-card">
            <span className="analysis-label">{card.title}</span>
            <strong className="analysis-value">{card.value}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}
