import { useState } from 'react'

/**
 * TempPasswordDialog
 *
 * Shown once after admin creates a farmer account.
 * Displays the generated temporary password with a copy button.
 * Closing the dialog destroys the password display — it cannot be recovered.
 *
 * Props:
 *   password   {string}   - the temporary password to display
 *   farmerName {string}   - farmer's name for the heading
 *   onClose    {function} - called when user acknowledges and closes
 */
export function TempPasswordDialog({ password, farmerName, onClose }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="fm-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tmppass-title"
      onClick={(e) => {
        // prevent close on backdrop click — user MUST acknowledge
        e.stopPropagation()
      }}
    >
      <div className="fm-modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="fm-modal-header">
          <h2 id="tmppass-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="var(--accent-green)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Temporary Password
          </h2>
        </div>

        {/* Body */}
        <div className="fm-modal-body">
          <p style={{ marginBottom: 12, color: 'var(--text-secondary)' }}>
            Farmer <strong>{farmerName}</strong> has been created. Share this temporary
            password with them securely. They will be prompted to change it on first login.
          </p>

          {/* Password display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--bg-secondary, #f0f4f0)',
            border: '1px solid var(--border-color, #d0d8d0)',
            borderRadius: 'var(--radius-sm, 8px)',
            padding: '10px 14px',
            marginBottom: 16,
          }}>
            <code style={{
              flex: 1,
              fontFamily: 'monospace',
              fontSize: 18,
              letterSpacing: 2,
              color: 'var(--text-primary)',
              wordBreak: 'break-all',
            }}>
              {password}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              title="Copy password"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                color: copied ? 'var(--accent-green)' : 'var(--text-secondary)',
                flexShrink: 0,
              }}
            >
              {copied ? (
                /* checkmark */
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                /* copy icon */
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>

          <p style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            background: 'rgba(234, 179, 8, 0.08)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: 'var(--radius-sm, 8px)',
            padding: '8px 12px',
          }}>
            ⚠ This password will NOT be shown again after you close this dialog.
          </p>
        </div>

        {/* Footer */}
        <div className="fm-modal-footer">
          <button
            type="button"
            className="fm-btn fm-btn--primary"
            onClick={onClose}
            id="tmppass-close-btn"
          >
            I have noted the password — Close
          </button>
        </div>
      </div>
    </div>
  )
}

