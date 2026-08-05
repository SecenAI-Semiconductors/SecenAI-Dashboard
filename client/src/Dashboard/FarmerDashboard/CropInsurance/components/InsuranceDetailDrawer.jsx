/**
 * InsuranceDetailDrawer.jsx
 *
 * Slide-in drawer showing complete insurance application details.
 * Follows the FarmerViewDrawer.jsx pattern.
 */

import { useEffect } from 'react'

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

export function InsuranceDetailDrawer({ request, onClose }) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!request) return null

  const detailSections = [
    {
      title: 'Crop Information',
      icon: '🌾',
      rows: [
        { label: 'Crop Name', value: request.cropName },
        { label: 'Crop Type', value: request.cropType },
        { label: 'Crop Season', value: request.cropSeason },
        { label: 'Estimated Yield', value: `${request.estimatedYield} quintals` },
      ],
    },
    {
      title: 'Land Details',
      icon: '🏞️',
      rows: [
        { label: 'Land Area', value: `${request.landArea} acres` },
        { label: 'Soil Type', value: request.soilType },
        { label: 'Irrigation Type', value: request.irrigationType },
      ],
    },
    {
      title: 'Location',
      icon: '📍',
      rows: [
        { label: 'District', value: request.district },
        { label: 'State', value: request.state },
      ],
    },
    {
      title: 'Schedule',
      icon: '📅',
      rows: [
        { label: 'Sowing Date', value: formatDate(request.sowingDate) },
        { label: 'Expected Harvest', value: formatDate(request.expectedHarvestDate) },
      ],
    },
    {
      title: 'Insurance Details',
      icon: '🛡️',
      rows: [
        {
          label: 'Requested Coverage',
          value: `₹${(request.requestedCoverage || 0).toLocaleString('en-IN')}`,
        },
        {
          label: 'Estimated Premium',
          value: `₹${(request.estimatedInsurancePremium || 0).toLocaleString('en-IN')}`,
          highlight: true,
        },
        { label: 'Premium Rate', value: '2.00%' },
      ],
    },
    {
      title: 'Application Info',
      icon: '📋',
      rows: [
        { label: 'Farmer Name', value: request.farmerName },
        { label: 'Application Date', value: formatDate(request.createdAt) },
        { label: 'Last Updated', value: formatDate(request.updatedAt) },
        { label: 'Remarks', value: request.remarks || '—' },
      ],
    },
  ]

  return (
    <>
      {/* Backdrop */}
      <div className="ci-drawer-backdrop" onClick={onClose} />

      {/* Drawer */}
      <div className="ci-drawer" id="insurance-detail-drawer" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="ci-drawer-header">
          <div className="ci-drawer-header-left">
            <h2 className="ci-drawer-title">Insurance Application</h2>
            <span className={`ci-status-badge ${getStatusClass(request.status)}`}>
              {request.status}
            </span>
          </div>
          <button
            className="ci-drawer-close"
            onClick={onClose}
            aria-label="Close drawer"
            id="ci-drawer-close-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="ci-drawer-content">
          {detailSections.map((section) => (
            <div key={section.title} className="ci-drawer-section">
              <div className="ci-drawer-section-header">
                <span className="ci-drawer-section-icon">{section.icon}</span>
                <h3 className="ci-drawer-section-title">{section.title}</h3>
              </div>
              <div className="ci-drawer-rows">
                {section.rows.map((row) => (
                  <div
                    key={row.label}
                    className={`ci-drawer-row${row.highlight ? ' ci-drawer-row--highlight' : ''}`}
                  >
                    <span className="ci-drawer-row-label">{row.label}</span>
                    <span className="ci-drawer-row-value">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
