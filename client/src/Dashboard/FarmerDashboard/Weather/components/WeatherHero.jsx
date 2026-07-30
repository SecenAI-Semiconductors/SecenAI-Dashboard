import { getIconUrl } from '../../../../api/weatherApi'

function formatTime(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export function WeatherHero({ weather, location, summary }) {
  return (
    <section className="weather-hero-card glass-card">
      <div className="hero-left">
        <div className="hero-top-row">
          <div>
            <span className="weather-badge">Current Weather</span>
            <h2 className="weather-hero-title">{location}</h2>
            <p className="weather-hero-subtitle">Last updated {formatTime(weather.lastUpdated)} • {formatDate(weather.lastUpdated)}</p>
          </div>
          <div className="weather-hero-summary">
            <span>{summary.uvRisk} UV Risk</span>
            <span>{summary.dayRainChance}% Rain Chance</span>
          </div>
        </div>

        <div className="hero-main-row">
          <div className="hero-temperature">
            <img src={getIconUrl(weather.icon)} alt={weather.description} className="hero-weather-icon" />
            <div>
              <div className="hero-temp-value">{weather.temp}°C</div>
              <div className="hero-weather-text">{weather.description}</div>
            </div>
          </div>

          <div className="hero-details-grid">
            <div className="hero-detail-card">
              <span>Feels like</span>
              <strong>{weather.feelsLike}°C</strong>
            </div>
            <div className="hero-detail-card">
              <span>Humidity</span>
              <strong>{weather.humidity}%</strong>
            </div>
            <div className="hero-detail-card">
              <span>Wind</span>
              <strong>{weather.windSpeed} km/h</strong>
            </div>
            <div className="hero-detail-card">
              <span>Visibility</span>
              <strong>{weather.visibility} km</strong>
            </div>
            <div className="hero-detail-card">
              <span>UV Index</span>
              <strong>{weather.uvi}</strong>
            </div>
            <div className="hero-detail-card">
              <span>Pressure</span>
              <strong>{weather.pressure} hPa</strong>
            </div>
            <div className="hero-detail-card">
              <span>Sunrise</span>
              <strong>{formatTime(weather.sunrise)}</strong>
            </div>
            <div className="hero-detail-card">
              <span>Sunset</span>
              <strong>{formatTime(weather.sunset)}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
