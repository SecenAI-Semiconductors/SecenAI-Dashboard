import React from 'react';

export function AdminInsuranceDrawer({ isOpen, onClose, application, onAction }) {
  if (!isOpen || !application) return null;

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  const formatDate = (val) => new Date(val).toLocaleDateString('en-IN');

  const showActions = application.status === 'Pending' || application.status === 'Resubmitted';

  return (
    <div className="cim-drawer-overlay" onClick={(e) => e.target.className === 'cim-drawer-overlay' && onClose()}>
      <div className="cim-drawer">
        <div className="cim-drawer-header">
          <h2>Application Details</h2>
          <button className="cim-drawer-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="cim-drawer-body">
          <div className="cim-section">
            <h3>Farmer Information</h3>
            <div className="cim-grid">
              <div className="cim-field">
                <span className="cim-field-label">Farmer Name</span>
                <span className="cim-field-value">{application.farmerName}</span>
              </div>
              <div className="cim-field">
                <span className="cim-field-label">Location</span>
                <span className="cim-field-value">{application.district}, {application.state}</span>
              </div>
            </div>
          </div>

          <div className="cim-section">
            <h3>Land Information</h3>
            <div className="cim-grid">
              <div className="cim-field">
                <span className="cim-field-label">Land Area (Acres)</span>
                <span className="cim-field-value">{application.landArea}</span>
              </div>
              <div className="cim-field">
                <span className="cim-field-label">Soil Type</span>
                <span className="cim-field-value">{application.soilType}</span>
              </div>
              <div className="cim-field">
                <span className="cim-field-label">Irrigation Type</span>
                <span className="cim-field-value">{application.irrigationType}</span>
              </div>
            </div>
          </div>

          <div className="cim-section">
            <h3>Crop Information</h3>
            <div className="cim-grid">
              <div className="cim-field">
                <span className="cim-field-label">Crop Name</span>
                <span className="cim-field-value">{application.cropName}</span>
              </div>
              <div className="cim-field">
                <span className="cim-field-label">Crop Type</span>
                <span className="cim-field-value">{application.cropType}</span>
              </div>
              <div className="cim-field">
                <span className="cim-field-label">Season</span>
                <span className="cim-field-value">{application.cropSeason}</span>
              </div>
              <div className="cim-field">
                <span className="cim-field-label">Sowing Date</span>
                <span className="cim-field-value">{formatDate(application.sowingDate)}</span>
              </div>
              <div className="cim-field">
                <span className="cim-field-label">Expected Harvest</span>
                <span className="cim-field-value">{formatDate(application.expectedHarvestDate)}</span>
              </div>
              <div className="cim-field">
                <span className="cim-field-label">Estimated Yield (Quintals)</span>
                <span className="cim-field-value">{application.estimatedYield}</span>
              </div>
            </div>
          </div>

          <div className="cim-section">
            <h3>Insurance Information</h3>
            <div className="cim-grid">
              <div className="cim-field">
                <span className="cim-field-label">Requested Coverage</span>
                <span className="cim-field-value">{formatCurrency(application.requestedCoverage)}</span>
              </div>
              <div className="cim-field">
                <span className="cim-field-label">Estimated Premium</span>
                <span className="cim-field-value">{formatCurrency(application.estimatedInsurancePremium)}</span>
              </div>
              <div className="cim-field">
                <span className="cim-field-label">Status</span>
                <span className="cim-field-value">
                  <span className={`cim-status ${application.status.toLowerCase().replace(' ', '-')}`}>
                    {application.status}
                  </span>
                </span>
              </div>
              <div className="cim-field">
                <span className="cim-field-label">Application Date</span>
                <span className="cim-field-value">{formatDate(application.createdAt)}</span>
              </div>
            </div>
          </div>

          {application.adminRemarks && (
            <div className="cim-section">
              <h3>Admin Remarks</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '4px' }}>
                {application.adminRemarks}
              </p>
            </div>
          )}

          {application.reviewHistory && application.reviewHistory.length > 0 && (
            <div className="cim-section">
              <h3>Review History</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                {application.reviewHistory.map((hist, idx) => (
                  <li key={idx} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <strong>{hist.action}</strong> - {formatDate(hist.reviewedAt)}
                    <br/>
                    {hist.remarks}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {showActions && (
          <div className="cim-drawer-footer">
            <div className="cim-drawer-footer-left">
              <button className="cim-btn cim-btn-reject" onClick={() => onAction(application, 'reject')}>Reject</button>
              <button className="cim-btn cim-btn-review" onClick={() => onAction(application, 'review')}>Request Changes</button>
            </div>
            <button className="cim-btn cim-btn-approve" onClick={() => onAction(application, 'approve')}>Approve Application</button>
          </div>
        )}
      </div>
    </div>
  );
}
