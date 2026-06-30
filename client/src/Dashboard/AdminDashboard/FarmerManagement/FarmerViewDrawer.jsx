/**
 * Slide-in drawer for viewing farmer details.
 * Displays all fields with icons in a clean layout.
 */
export function FarmerViewDrawer({ farmer, onClose }) {
  if (!farmer) return null

  const initials = farmer.fullName
    ? farmer.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  const createdDate = farmer.createdAt
    ? new Date(farmer.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—'

  return (
    <>
      <div className="fm-drawer-overlay" onClick={onClose} />
      <aside className="fm-drawer" id="farmer-view-drawer" role="dialog" aria-label="Farmer Details">
        {/* Header */}
        <div className="fm-drawer-header">
          <h2>Farmer Details</h2>
          <button className="fm-modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="fm-drawer-body">
          {/* Profile section */}
          <div className="fm-drawer-profile">
            <div className="fm-drawer-avatar">{initials}</div>
            <div className="fm-drawer-name">{farmer.fullName}</div>
            <div className="fm-drawer-email">{farmer.email}</div>
          </div>

          {/* Detail grid */}
          <div className="fm-detail-grid">
            <DetailItem
              icon={<PhoneIcon />}
              label="Phone"
              value={farmer.phone || '—'}
            />
            <DetailItem
              icon={<MapPinIcon />}
              label="District"
              value={farmer.district || '—'}
            />
            <DetailItem
              icon={<GlobeIcon />}
              label="State"
              value={farmer.state || '—'}
            />
            <DetailItem
              icon={<LanguageIcon />}
              label="Preferred Language"
              value={farmer.language || '—'}
            />
            <DetailItem
              icon={<LandIcon />}
              label="Total Land Area"
              value={farmer.totalLandArea ? `${farmer.totalLandArea} acres` : '—'}
            />
            <DetailItem
              icon={<StatusIcon />}
              label="Account Status"
              value={
                <span className={`fm-status fm-status--${farmer.status || 'active'}`}>
                  <span className="fm-status-dot" />
                  {farmer.status || 'active'}
                </span>
              }
            />
            <DetailItem
              icon={<CalendarIcon />}
              label="Created Date"
              value={createdDate}
            />
          </div>
        </div>
      </aside>
    </>
  )
}

/* ===== Detail Row Component ===== */

function DetailItem({ icon, label, value }) {
  return (
    <div className="fm-detail-item">
      <div className="fm-detail-icon">{icon}</div>
      <div className="fm-detail-content">
        <div className="fm-detail-label">{label}</div>
        <div className="fm-detail-value">{value}</div>
      </div>
    </div>
  )
}

/* ===== Inline SVG Icons ===== */

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </svg>
  )
}

function LanguageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  )
}

function LandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 22h20" />
      <path d="M2 22 12 6l10 16" />
      <path d="M12 6 7 14h10" />
    </svg>
  )
}

function StatusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
