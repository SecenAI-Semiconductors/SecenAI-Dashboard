import { evaluateMoisture, STATUS } from '../utils/soilThresholds'

export function IrrigationRecommendation({ soil }) {
  const m = evaluateMoisture(soil.moisture)
  
  let recTitle = 'Monitor Moisture'
  if (m.status === STATUS.GOOD) recTitle = 'No immediate action required'
  else if (m.status === STATUS.POOR) recTitle = 'Immediate irrigation recommended'
  else recTitle = 'Moderate irrigation recommended'

  return (
    <section className="si-section glass-card si-irrigation-section">
      <div className="si-section-header">
        <span className="si-section-icon">🚰</span>
        <h2>Irrigation Recommendation</h2>
      </div>
      
      <div className="si-irrig-content">
        <h3 className="si-irrig-title">{recTitle}</h3>
        
        <div className="si-irrig-factors">
          <div className="si-irrig-factor">
            <span className="si-factor-label">Soil Moisture:</span>
            <span className="si-factor-value">{Math.round(soil.moisture)}%</span>
          </div>
          <div className="si-irrig-factor">
            <span className="si-factor-label">Weather Data:</span>
            <span className="si-factor-value si-factor-muted">Not integrated</span>
          </div>
        </div>
        
        <p className="si-irrig-note">
          Note: This recommendation is based purely on current soil moisture levels. Local weather conditions should also be considered.
        </p>
      </div>
    </section>
  )
}
