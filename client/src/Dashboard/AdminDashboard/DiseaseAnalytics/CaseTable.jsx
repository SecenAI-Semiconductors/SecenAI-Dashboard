export function CaseTable({ data, loading, page, totalPages, onPageChange, onRowClick }) {
  if (loading) {
    return (
      <div className="da-card">
        <h2 className="da-section-title">Detection Cases</h2>
        <div className="da-table-container">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="da-skeleton-row">
              <div className="da-skeleton da-skeleton--short" />
              <div className="da-skeleton da-skeleton--text" />
              <div className="da-skeleton da-skeleton--short" />
              <div className="da-skeleton da-skeleton--badge" />
              <div className="da-skeleton da-skeleton--short" />
              <div className="da-skeleton da-skeleton--short" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.cases?.length === 0) {
    return (
      <div className="da-card">
        <h2 className="da-section-title">Detection Cases</h2>
        <div className="da-empty">No cases match the current filters.</div>
      </div>
    )
  }

  return (
    <div className="da-card">
      <h2 className="da-section-title">Detection Cases</h2>
      <p className="da-section-subtitle">{data.total} total cases · Page {page} of {totalPages}</p>
      <div className="da-table-container">
        <table className="da-table" id="cases-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Crop</th>
              <th>Disease</th>
              <th>Severity</th>
              <th>Health Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.cases.map((c) => (
              <tr
                key={c.detectionId}
                className="da-row-clickable"
                onClick={() => onRowClick(c.detectionId)}
                id={`case-row-${c.detectionId}`}
              >
                <td>
                  <div className="da-field-cell">
                    <span className="da-field-id">{c.fieldId}</span>
                    <span className="da-field-name">{c.fieldName}</span>
                  </div>
                </td>
                <td>{c.crop}</td>
                <td className="da-td-disease">{c.disease}</td>
                <td>
                  <span className={`da-severity-badge da-severity--${c.severity?.toLowerCase()}`}>
                    {c.severity}
                  </span>
                </td>
                <td>
                  <span className={`da-health-score da-health--${c.healthScore >= 60 ? 'good' : c.healthScore >= 40 ? 'warn' : 'danger'}`}>
                    {c.healthScore}
                  </span>
                </td>
                <td className="da-td-date">
                  {new Date(c.scanDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="da-pagination">
          <button
            className="da-page-btn"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            ← Previous
          </button>
          <div className="da-page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`da-page-num${p === page ? ' active' : ''}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            className="da-page-btn"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
