import React from 'react';

export function InsuranceTable({ applications, onView, onReview }) {
  if (!applications || applications.length === 0) {
    return <div className="cim-empty">No insurance applications found.</div>;
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  const formatDate = (val) => new Date(val).toLocaleDateString('en-IN');

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'pending';
      case 'Resubmitted': return 'resubmitted';
      case 'Review Required': return 'review-required';
      case 'Approved': return 'approved';
      case 'Rejected': return 'rejected';
      default: return 'pending';
    }
  };

  return (
    <div className="cim-table-container">
      <table className="cim-table">
        <thead>
          <tr>
            <th>Application ID</th>
            <th>Farmer</th>
            <th>Crop</th>
            <th>Location</th>
            <th>Coverage / Premium</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app._id}>
              <td>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  #{app._id.substring(app._id.length - 6).toUpperCase()}
                </div>
              </td>
              <td>
                <div style={{ fontWeight: 500 }}>{app.farmerName}</div>
              </td>
              <td>
                <div>{app.cropName}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{app.cropSeason} - {app.cropType}</div>
              </td>
              <td>
                <div>{app.district}, {app.state}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{app.landArea} Acres</div>
              </td>
              <td>
                <div>{formatCurrency(app.requestedCoverage)}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Prem: {formatCurrency(app.estimatedInsurancePremium)}</div>
              </td>
              <td>{formatDate(app.createdAt)}</td>
              <td>
                <span className={`cim-status ${getStatusClass(app.status)}`}>
                  {app.status}
                </span>
              </td>
              <td>
                <div className="cim-actions">
                  <button className="cim-action-btn view" onClick={() => onView(app)}>
                    View
                  </button>
                  {(app.status === 'Pending' || app.status === 'Resubmitted') && (
                    <button className="cim-action-btn review" onClick={() => onReview(app, 'approve')}>
                      Review
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
