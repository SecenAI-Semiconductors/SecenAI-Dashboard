/**
 * InsuranceOverview.jsx
 *
 * Overview statistics cards for the Crop Insurance dashboard.
 * Displays: Total Applications, Pending, Approved, Rejected,
 * Estimated Total Coverage.
 */

export function InsuranceOverview({ stats }) {
  const cards = [
    {
      id: 'ci-total',
      label: 'Total Applications',
      value: stats.total,
      icon: '📋',
      accent: 'var(--accent-farmer)',
    },
    {
      id: 'ci-pending',
      label: 'Pending',
      value: stats.pending,
      icon: '⏳',
      accent: '#e5a117',
    },
    {
      id: 'ci-approved',
      label: 'Approved',
      value: stats.approved,
      icon: '✅',
      accent: '#2e9e50',
    },
    {
      id: 'ci-rejected',
      label: 'Rejected',
      value: stats.rejected,
      icon: '❌',
      accent: '#c0392b',
    },
    {
      id: 'ci-coverage',
      label: 'Total Coverage',
      value: `₹${stats.totalCoverage.toLocaleString('en-IN')}`,
      icon: '🛡️',
      accent: '#22783c',
    },
  ]

  return (
    <section className="ci-section" id="insurance-overview">
      <div className="ci-section-header">
        <span className="ci-section-icon">📊</span>
        <h2 className="ci-section-title">Insurance Overview</h2>
      </div>
      <p className="ci-section-subtitle">
        Summary of your crop insurance applications and coverage.
      </p>

      <div className="ci-stats-grid">
        {cards.map((card) => (
          <div key={card.id} className="ci-stat-card" id={card.id}>
            <div className="ci-stat-icon-wrap" style={{ background: `${card.accent}12` }}>
              <span className="ci-stat-icon">{card.icon}</span>
            </div>
            <div className="ci-stat-label">{card.label}</div>
            <div className="ci-stat-value" style={{ color: card.accent }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
