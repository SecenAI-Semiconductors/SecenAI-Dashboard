/**
 * Delete confirmation dialog — modal with danger styling.
 * Shows farmer name and requires explicit confirmation.
 */
export function DeleteConfirmDialog({ farmer, isDeleting, onConfirm, onCancel }) {
  if (!farmer) return null

  return (
    <div className="fm-modal-overlay" onClick={onCancel} id="delete-confirm-dialog">
      <div
        className="fm-modal fm-confirm-modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-labelledby="delete-title"
        aria-describedby="delete-desc"
      >
        <div className="fm-confirm-body">
          <div className="fm-confirm-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>
          <h3 id="delete-title">Delete Farmer</h3>
          <p id="delete-desc">
            Are you sure you want to delete{' '}
            <span className="fm-confirm-name">{farmer.fullName}</span>?
            This action cannot be undone.
          </p>
        </div>
        <div className="fm-modal-footer">
          <button
            className="fm-btn fm-btn--secondary"
            onClick={onCancel}
            disabled={isDeleting}
            id="delete-cancel-btn"
          >
            Cancel
          </button>
          <button
            className="fm-btn fm-btn--danger"
            onClick={onConfirm}
            disabled={isDeleting}
            id="delete-confirm-btn"
          >
            {isDeleting ? (
              <>
                <span className="fm-spinner" />
                Deleting…
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
