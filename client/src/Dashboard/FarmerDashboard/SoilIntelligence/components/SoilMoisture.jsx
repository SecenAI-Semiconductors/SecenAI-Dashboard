import { evaluateMoisture, STATUS } from '../utils/soilThresholds'

export function SoilMoisture({ soil }) {
  const evalResult = evaluateMoisture(soil.moisture)
  const isGood = evalResult.status === STATUS.GOOD
  const isModerate = evalResult.status === STATUS.MODERATE
  
  let moistureClass = 'si-moisture-poor'
  if (isGood) moistureClass = 'si-moisture-good'
  else if (isModerate) moistureClass = 'si-moisture-moderate'

  const moisturePercent = Math.min(100, Math.max(0, soil.moisture || 0))

  return (
    <section className="si-section glass-card si-moisture-section">
      <div className="si-section-header">
        <span className="si-section-icon">💧</span>
        <h2>Soil Moisture</h2>
      </div>
      
      <div className="si-moisture-content">
        <div className="si-moisture-visual">
          <div className="si-moisture-circle">
            <div 
              className={`si-moisture-wave ${moistureClass}`} 
              style={{ top: `${100 - moisturePercent}%` }} 
            />
            <span className="si-moisture-value">{moisturePercent}%</span>
          </div>
        </div>
        
        <div className="si-moisture-details">
          <div className={`si-moisture-status ${moistureClass}`}>
            {evalResult.status} Moisture
          </div>
          <p className="si-moisture-desc">{evalResult.message}</p>
        </div>
      </div>
    </section>
  )
}
