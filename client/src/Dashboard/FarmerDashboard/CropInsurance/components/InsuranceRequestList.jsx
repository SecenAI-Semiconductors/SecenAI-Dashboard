/**
 * InsuranceRequestList.jsx
 *
 * Displays all submitted insurance applications as cards.
 * Each card shows: Crop Name, Coverage Amount, Estimated Premium,
 * Application Date, and Current Status with color coding.
 */

/**
 * Format a date string for display.
 */
function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Status badge color mapping.
 */
function getStatusClass(status) {
  switch (status) {
    case 'Approved':
      return 'ci-status--approved'
    case 'Rejected':
      return 'ci-status--rejected'
    case 'Pending':
    default:
      return 'ci-status--pending'
  }
}

export function InsuranceRequestList({ requests, onViewDetails }) {
  return (
    <section className="ci-section" id="insurance-requests-section">
      <div className="ci-section-header">
        <span className="ci-section-icon">📄</span>
        <h2 className="ci-section-title">My Insurance Requests</h2>
      </div>
      <p className="ci-section-subtitle">
        Track and manage all your submitted insurance applications.
      </p>

      {/* Empty State */}
      {requests.length === 0 && (
        <div className="ci-empty-state" id="ci-empty-state">
          <div className="ci-empty-icon">🛡️</div>
          <h3 className="ci-empty-title">No insurance applications submitted yet.</h3>
          <p className="ci-empty-text">
            Submit your first crop insurance application using the form above.
          </p>
          <a href="#insurance-form-section" className="ci-empty-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            Apply Now
          </a>
        </div>
      )}

      {/* Request Cards Grid */}
      {requests.length > 0 && (
        <div className="ci-requests-grid">
          {requests.map((req) => (
            <div key={req._id} className="ci-request-card" id={`ci-request-${req._id}`}>
              <div className="ci-request-accent-bar" />
              <div className="ci-request-body">
                {/* Header: Crop Name + Status */}
                <div className="ci-request-header">
                  <div className="ci-request-crop">
                    <span className="ci-request-crop-icon">🌾</span>
                    <div>
                      <div className="ci-request-crop-name">{req.cropName}</div>
                      <div className="ci-request-crop-type">{req.cropType} · {req.cropSeason}</div>
                    </div>
                  </div>
                  <span className={`ci-status-badge ${getStatusClass(req.status)}`}>
                    {req.status}
                  </span>
                </div>

                {/* Details */}
                <div className="ci-request-details">
                  <div className="ci-request-detail">
                    <span className="ci-request-detail-label">Coverage</span>
                    <span className="ci-request-detail-value">
                      ₹{(req.requestedCoverage || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="ci-request-detail">
                    <span className="ci-request-detail-label">Premium</span>
                    <span className="ci-request-detail-value">
                      ₹{(req.estimatedInsurancePremium || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="ci-request-detail">
                    <span className="ci-request-detail-label">Applied On</span>
                    <span className="ci-request-detail-value">
                      {formatDate(req.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="ci-request-footer">
                  <span className="ci-request-location">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {req.district}, {req.state}
                  </span>
                  <button
                    type="button"
                    className="ci-view-btn"
                    onClick={() => onViewDetails(req)}
                    id={`ci-view-${req._id}`}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
