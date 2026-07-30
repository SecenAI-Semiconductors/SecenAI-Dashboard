import { getIconUrl } from '../../../../api/weatherApi'

export function WeeklyForecast({ daily }) {
  return (
    <section className="weather-section">
      <div className="section-heading-row">
        <h2>7-Day Forecast</h2>
        <span>Weekly weather outlook</span>
      </div>
      <div className="weekly-grid">
        {daily.map((day) => (
          <article key={day.day} className="weekly-card glass-card">
            <span className="weekly-day">{day.day}</span>
            <img src={getIconUrl(day.icon)} alt="weather" className="weekly-icon" />
            <div className="weekly-temps">
              <strong>{day.maxTemp}°</strong>
              <span>{day.minTemp}°</span>
            </div>
            <span className="weekly-pop">{day.pop}% rain</span>
          </article>
        ))}
      </div>
    </section>
  )
}
