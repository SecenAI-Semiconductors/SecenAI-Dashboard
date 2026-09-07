export function SoilAlerts({ alerts }) {
  if (!alerts || alerts.length === 0) return null

  return (
    <section className="si-section si-alerts-section">
      <div className="si-section-header">
        <span className="si-section-icon">⚠️</span>
        <h2>Soil Alerts</h2>
      </div>
      
      <div className="si-alerts-list">
        {alerts.map((alert, i) => (
          <div key={i} className={`si-alert-card si-alert-${alert.type}`}>
            <div className="si-alert-header">
              <span className="si-alert-icon">
                {alert.type === 'critical' ? '🔴' : alert.type === 'warning' ? '🟠' : '🔵'}
              </span>
              <h4>{alert.title}</h4>
            </div>
            <p className="si-alert-desc">{alert.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
