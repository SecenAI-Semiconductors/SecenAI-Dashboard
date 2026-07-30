import { getIconUrl } from '../../../../api/weatherApi'

export function HourlyForecast({ hourly }) {
  return (
    <section className="weather-section">
      <div className="section-heading-row">
        <h2>Hourly Forecast</h2>
        <span>Next 24 hours</span>
      </div>
      <div className="hourly-scroll">
        {hourly.map((hour) => (
          <article key={hour.time} className="hourly-card glass-card">
            <span className="hourly-time">{hour.time}</span>
            <img src={getIconUrl(hour.icon)} alt="Forecast" className="hourly-icon" />
            <span className="hourly-temp">{hour.temp}°</span>
            <span className="hourly-pop">{hour.pop}% rain</span>
          </article>
        ))}
      </div>
    </section>
  )
}
