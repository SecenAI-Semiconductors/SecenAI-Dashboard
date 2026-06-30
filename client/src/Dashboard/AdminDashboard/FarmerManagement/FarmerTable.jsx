/**
 * Farmer data table with sortable columns, avatar, status badge, and action buttons.
 */
export function FarmerTable({ farmers, onView, onEdit, onDelete, isDeleting, sortConfig, onSort }) {
  return (
    <div className="fm-table-container" id="farmer-table">
      <div className="fm-table-scroll">
        <table className="fm-table">
          <thead>
            <tr>
              <SortableHeader label="Farmer" sortKey="fullName" sortConfig={sortConfig} onSort={onSort} />
              <SortableHeader label="Email" sortKey="email" sortConfig={sortConfig} onSort={onSort} />
              <th>Phone</th>
              <SortableHeader label="District" sortKey="district" sortConfig={sortConfig} onSort={onSort} />
              <SortableHeader label="State" sortKey="state" sortConfig={sortConfig} onSort={onSort} />
              <SortableHeader label="Land (acres)" sortKey="totalLandArea" sortConfig={sortConfig} onSort={onSort} />
              <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} onSort={onSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {farmers.map((farmer) => (
              <FarmerRow
                key={farmer._id}
                farmer={farmer}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ===== Sortable Column Header ===== */

function SortableHeader({ label, sortKey, sortConfig, onSort }) {
  const isActive = sortConfig.key === sortKey
  const direction = isActive ? sortConfig.direction : null

  return (
    <th
      className="fm-th-sortable"
      onClick={() => onSort(sortKey)}
      role="columnheader"
      aria-sort={isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span className="fm-th-sort-content">
        {label}
        <span className={`fm-sort-icon${isActive ? ' fm-sort-icon--active' : ''}`}>
          {direction === 'asc' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 15-6-6-6 6" />
            </svg>
          ) : direction === 'desc' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7 15 5 5 5-5" />
              <path d="m7 9 5-5 5 5" />
            </svg>
          )}
        </span>
      </span>
    </th>
  )
}

/* ===== Single Farmer Row ===== */

function FarmerRow({ farmer, onView, onEdit, onDelete, isDeleting }) {
  const initials = farmer.fullName
    ? farmer.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <tr id={`farmer-row-${farmer._id}`}>
      {/* Avatar + Name */}
      <td>
        <div className="fm-avatar-cell">
          <div className="fm-avatar">{initials}</div>
          <span className="fm-name">{farmer.fullName}</span>
        </div>
      </td>

      {/* Email */}
      <td>{farmer.email}</td>

      {/* Phone */}
      <td>{farmer.phone}</td>

      {/* District */}
      <td>{farmer.district || '—'}</td>

      {/* State */}
      <td>{farmer.state || '—'}</td>

      {/* Land Area */}
      <td>{farmer.totalLandArea || 0}</td>

      {/* Status Badge */}
      <td>
        <span className={`fm-status fm-status--${farmer.status || 'active'}`}>
          <span className="fm-status-dot" />
          {farmer.status || 'active'}
        </span>
      </td>

      {/* Actions */}
      <td>
        <div className="fm-actions">
          <button
            className="fm-action-btn"
            title="View"
            onClick={() => onView(farmer)}
            aria-label={`View ${farmer.fullName}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button
            className="fm-action-btn"
            title="Edit"
            onClick={() => onEdit(farmer)}
            aria-label={`Edit ${farmer.fullName}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>
          <button
            className="fm-action-btn fm-action-btn--delete"
            title="Delete"
            onClick={() => onDelete(farmer)}
            disabled={isDeleting}
            aria-label={`Delete ${farmer.fullName}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}

/* ===== Skeleton Loader ===== */

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="fm-table-container">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="fm-skeleton-row">
          <div className="fm-skeleton fm-skeleton--circle" />
          <div className="fm-skeleton fm-skeleton--text" />
          <div className="fm-skeleton fm-skeleton--text" />
          <div className="fm-skeleton fm-skeleton--short" />
          <div className="fm-skeleton fm-skeleton--short" />
          <div className="fm-skeleton fm-skeleton--badge" />
          <div className="fm-skeleton fm-skeleton--short" />
        </div>
      ))}
    </div>
  )
}
