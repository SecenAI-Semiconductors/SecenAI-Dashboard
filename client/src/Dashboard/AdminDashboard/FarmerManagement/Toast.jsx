import { useState, useEffect, useCallback } from 'react'

/**
 * Lightweight toast notification system.
 * Usage: const { toasts, showToast } = useToast()
 */
export function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      )
      // Remove from DOM after exit animation
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 250)
    }, 4000)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    )
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 250)
  }, [])

  return { toasts, showToast, dismissToast }
}

/* ===== Toast Icon Components ===== */

function SuccessIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="fm-toast-icon">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="fm-toast-icon">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="fm-toast-icon">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

const iconMap = { success: SuccessIcon, error: ErrorIcon, info: InfoIcon }

/**
 * Toast container component — renders all active toasts.
 */
export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null

  return (
    <div className="fm-toast-container" id="toast-container">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type] || InfoIcon
        return (
          <div
            key={toast.id}
            className={`fm-toast fm-toast--${toast.type}${toast.exiting ? ' fm-toast--exiting' : ''}`}
            role="alert"
          >
            <Icon />
            <span className="fm-toast-message">{toast.message}</span>
            <button
              className="fm-toast-close"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
