import { evaluatePH, evaluateMoisture, evaluateNitrogen, evaluatePhosphorus, evaluatePotassium, evaluateOC, evaluateEC, STATUS, LEVEL } from '../utils/soilThresholds'

function ParameterCard({ title, value, unit, evalResult }) {
  const isGood = evalResult.status === STATUS.GOOD || evalResult.level === LEVEL.OPTIMAL
  const isModerate = evalResult.status === STATUS.MODERATE
  
  let statusClass = 'si-param-poor'
  if (isGood) statusClass = 'si-param-good'
  else if (isModerate) statusClass = 'si-param-moderate'

  return (
    <div className="si-param-card">
      <div className="si-param-header">
        <h4>{title}</h4>
        <span className={`si-param-badge ${statusClass}`}>
          {evalResult.status || evalResult.level}
        </span>
      </div>
      <div className="si-param-value">
        {value !== undefined ? value : '--'} <span className="si-param-unit">{unit}</span>
      </div>
      <p className="si-param-desc">{evalResult.message}</p>
    </div>
  )
}

export function SoilParameterCards({ soil }) {
  return (
    <section className="si-section">
      <div className="si-section-header">
        <span className="si-section-icon">🧪</span>
        <h2>Key Soil Parameters</h2>
      </div>
      <div className="si-params-grid">
        <ParameterCard 
          title="pH" 
          value={soil.ph} 
          unit="" 
          evalResult={evaluatePH(soil.ph)} 
        />
        <ParameterCard 
          title="Moisture" 
          value={soil.moisture} 
          unit="%" 
          evalResult={evaluateMoisture(soil.moisture)} 
        />
        <ParameterCard 
          title="Nitrogen" 
          value={soil.nitrogen} 
          unit="mg/kg" 
          evalResult={evaluateNitrogen(soil.nitrogen)} 
        />
        <ParameterCard 
          title="Phosphorus" 
          value={soil.phosphorus} 
          unit="mg/kg" 
          evalResult={evaluatePhosphorus(soil.phosphorus)} 
        />
        <ParameterCard 
          title="Potassium" 
          value={soil.potassium} 
          unit="mg/kg" 
          evalResult={evaluatePotassium(soil.potassium)} 
        />
        <ParameterCard 
          title="Organic Carbon" 
          value={soil.organicCarbon} 
          unit="%" 
          evalResult={evaluateOC(soil.organicCarbon)} 
        />
        <ParameterCard 
          title="Electrical Conductivity" 
          value={soil.electricalConductivity} 
          unit="dS/m" 
          evalResult={evaluateEC(soil.electricalConductivity)} 
        />
      </div>
    </section>
  )
}
