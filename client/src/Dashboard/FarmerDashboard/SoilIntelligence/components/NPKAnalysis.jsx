import { evaluateNitrogen, evaluatePhosphorus, evaluatePotassium, LEVEL } from '../utils/soilThresholds'

function NPKBar({ label, value, evalResult, max }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100)) || 0
  
  let barClass = 'si-bar-high'
  if (evalResult.level === LEVEL.OPTIMAL) barClass = 'si-bar-optimal'
  else if (evalResult.level === LEVEL.LOW) barClass = 'si-bar-low'

  return (
    <div className="si-npk-row">
      <div className="si-npk-info">
        <span className="si-npk-label">{label}</span>
        <span className={`si-npk-badge ${barClass}`}>{evalResult.level}</span>
      </div>
      <div className="si-npk-track">
        <div className={`si-npk-fill ${barClass}`} style={{ width: `${percent}%` }} />
      </div>
      <p className="si-npk-desc">{evalResult.message}</p>
    </div>
  )
}

export function NPKAnalysis({ soil }) {
  return (
    <section className="si-section glass-card si-npk-section">
      <div className="si-section-header">
        <span className="si-section-icon">🌱</span>
        <h2>NPK Analysis</h2>
      </div>
      <div className="si-npk-container">
        <NPKBar 
          label="Nitrogen (N)" 
          value={soil.nitrogen} 
          max={800} 
          evalResult={evaluateNitrogen(soil.nitrogen)} 
        />
        <NPKBar 
          label="Phosphorus (P)" 
          value={soil.phosphorus} 
          max={50} 
          evalResult={evaluatePhosphorus(soil.phosphorus)} 
        />
        <NPKBar 
          label="Potassium (K)" 
          value={soil.potassium} 
          max={400} 
          evalResult={evaluatePotassium(soil.potassium)} 
        />
      </div>
    </section>
  )
}
