import { getPreflightCheck } from './mockData';

const CHECK_ICONS = {
  pass: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  warn: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  ),
  fail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  ),
};

export function ScheduleFlightModal({ drone, preflightCheck, onConfirm, onClose }) {
  const checks = preflightCheck
    ? Object.values(preflightCheck)
    : [];

  const hasFail = checks.some(c => c.status === 'fail');

  return (
    <div className="dom-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dom-modal">
        <h3>Pre-Flight Readiness Check</h3>
        <p className="dom-modal-sub">
          {drone ? `${drone.id} — ${drone.model}` : 'Checking drone systems before scheduling.'}
        </p>

        <div className="dom-preflight-list">
          {checks.map(check => (
            <div key={check.label} className="dom-preflight-item">
              <div className="dom-preflight-left">
                <span className={`dom-preflight-icon ${check.status}`}>
                  {CHECK_ICONS[check.status]}
                </span>
                {check.label}
              </div>
              <span className="dom-preflight-detail">{check.detail}</span>
            </div>
          ))}
        </div>

        {hasFail && (
          <div className="dom-alert-item error" style={{ marginTop: 4 }}>
            One or more checks failed. Scheduling is still allowed but investigate before flight.
          </div>
        )}

        <div className="dom-modal-actions">
          <button className="dom-btn dom-btn-outline" onClick={onClose}>Cancel</button>
          <button className="dom-btn dom-btn-primary" onClick={onConfirm}>
            Confirm &amp; Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
