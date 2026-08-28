import { STATUS } from '../utils/soilThresholds'

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export function SoilOverview({ soil, health, farmerName }) {
  const isGood = health.condition === STATUS.GOOD
  const isModerate = health.condition === STATUS.MODERATE
  
  let scoreClass = 'si-score-poor'
  if (isGood) scoreClass = 'si-score-good'
  else if (isModerate) scoreClass = 'si-score-moderate'

  return (
    <section className="si-overview-card glass-card">
      <div className="si-overview-main">
        <div className="si-score-section">
          <span className="si-overview-label">Soil Health</span>
          <div className={`si-score-circle ${scoreClass}`}>
            <span className="si-score-value">{Math.round(health.score)}</span>
            <span className="si-score-max">/ 100</span>
          </div>
          <span className={`si-condition-badge ${scoreClass}`}>{health.condition} Condition</span>
        </div>

        <div className="si-overview-details">
          <div className="si-detail-block">
            <span className="si-detail-label">Field Name</span>
            <span className="si-detail-value">{farmerName ? `${farmerName}'s Farm` : 'Unknown'}</span>
          </div>
          <div className="si-detail-block">
            <span className="si-detail-label">Soil Type</span>
            <span className="si-detail-value">{soil.soilType || 'Unknown'}</span>
          </div>
          <div className="si-detail-block">
            <span className="si-detail-label">Last Updated</span>
            <span className="si-detail-value">{formatDate(soil.recordedAt)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
