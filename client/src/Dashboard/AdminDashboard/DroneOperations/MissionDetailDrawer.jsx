const ALERT_ICONS = {
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
    </svg>
  ),
};

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function MissionDetailDrawer({ mission, onClose }) {
  if (!mission) return null;

  const statusClass = mission.status.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="dom-drawer-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dom-drawer" role="dialog" aria-modal="true" aria-label="Mission Details">
        {/* Header */}
        <div className="dom-drawer-header">
          <h2>{mission.id}</h2>
          <button className="dom-drawer-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="dom-drawer-body">
          {/* Status + Summary */}
          <div className="dom-drawer-section">
            <h3>Mission Overview</h3>
            <div className="dom-detail-grid" style={{ marginBottom: 14 }}>
              <div className="dom-detail-field">
                <span className="dom-detail-label">Status</span>
                <span>
                  <span className={`dom-badge ${statusClass}`}>{mission.status}</span>
                </span>
              </div>
              <div className="dom-detail-field">
                <span className="dom-detail-label">Date</span>
                <span className="dom-detail-value">{formatDate(mission.date)}</span>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {mission.summary}
            </p>
          </div>

          {/* Mission Details Grid */}
          <div className="dom-drawer-section">
            <h3>Details</h3>
            <div className="dom-detail-grid">
              <div className="dom-detail-field">
                <span className="dom-detail-label">Drone</span>
                <span className="dom-detail-value">{mission.droneId}</span>
              </div>
              <div className="dom-detail-field">
                <span className="dom-detail-label">Model</span>
                <span className="dom-detail-value">{mission.droneModel}</span>
              </div>
              <div className="dom-detail-field">
                <span className="dom-detail-label">Operator</span>
                <span className="dom-detail-value">{mission.operatorName}</span>
              </div>
              <div className="dom-detail-field">
                <span className="dom-detail-label">Field</span>
                <span className="dom-detail-value">{mission.fieldName}</span>
              </div>
              <div className="dom-detail-field">
                <span className="dom-detail-label">Mission Type</span>
                <span className="dom-detail-value">{mission.missionType}</span>
              </div>
              <div className="dom-detail-field">
                <span className="dom-detail-label">Duration</span>
                <span className="dom-detail-value">{mission.duration}</span>
              </div>
              <div className="dom-detail-field">
                <span className="dom-detail-label">Coverage</span>
                <span className="dom-detail-value">{mission.coverage}</span>
              </div>
            </div>
          </div>

          {/* Alerts / Issues */}
          <div className="dom-drawer-section">
            <h3>Alerts &amp; Issues</h3>
            {mission.alerts.length === 0 ? (
              <p className="dom-no-alerts">✓ No alerts or issues reported for this mission.</p>
            ) : (
              <div className="dom-alert-list">
                {mission.alerts.map((alert, i) => (
                  <div key={i} className={`dom-alert-item ${alert.level}`}>
                    {ALERT_ICONS[alert.level]}
                    {alert.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
