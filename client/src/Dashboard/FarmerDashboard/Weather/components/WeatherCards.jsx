export function WeatherCards({ weather, summary }) {
  const cards = [
    {
      title: 'Max Temperature',
      value: `${summary.highestTemperature}°C`,
      icon: '🌡',
      gradient: 'gradient-temp',
    },
    {
      title: 'Rain Probability',
      value: `${summary.dayRainChance}%`,
      icon: '🌧',
      gradient: 'gradient-rain',
    },
    {
      title: 'Wind Speed',
      value: `${weather.windSpeed} km/h`,
      icon: '💨',
      gradient: 'gradient-wind',
    },
    {
      title: 'Humidity',
      value: `${weather.humidity}%`,
      icon: '💧',
      gradient: 'gradient-humidity',
    },
  ]

  return (
    <section className="weather-cards-grid">
      {cards.map((card) => (
        <article key={card.title} className={`weather-data-card ${card.gradient}`}>
          <div className="weather-card-icon">{card.icon}</div>
          <div>
            <span className="weather-card-label">{card.title}</span>
            <h3 className="weather-card-value">{card.value}</h3>
          </div>
        </article>
      ))}
    </section>
  )
}
