import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher'
import api from '../services/api'
import './AuthPages.css'

export function ChangePasswordPage() {
  const navigate          = useNavigate()
  const { user, setUser } = useAuth()

  const [form, setForm]     = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [error,  setError]  = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function change(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.currentPassword || !form.newPassword || !form.confirm) {
      setError('All fields are required.')
      return
    }
    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (form.newPassword !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.newPassword === form.currentPassword) {
      setError('New password must be different from current password.')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      })

      setUser(u => ({ ...u, mustChangePassword: false }))
      setSuccess('Password updated successfully!')

      setTimeout(() => {
        const dest = user?.role === 'admin' ? '/admin' : '/farmer'
        navigate(dest, { replace: true })
      }, 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  const isMustChange = Boolean(user?.mustChangePassword)

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Language switcher — admin-created farmers land here before seeing navbar */}
        <div className="auth-lang-row">
          <LanguageSwitcher />
        </div>

        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">S</div>
          <span className="auth-brand-name" translate="no">SecenAI</span>
        </div>

        {/*
          Title and subtitle change based on mustChangePassword.
          Keyed spans prevent GTranslate removeChild crash when
          the user object loads and the text node switches value.
        */}
        <h1 className="auth-title">
          <span key={isMustChange ? 'set' : 'change'}>
            {isMustChange ? 'Set Your Password' : 'Change Password'}
          </span>
        </h1>

        {isMustChange && (
          <p className="auth-subtitle">
            Your account was created by an admin. Please set a personal password to continue.
          </p>
        )}

        {error && (
          <div className="auth-error" role="alert">
            <span key={error}>{error}</span>
          </div>
        )}
        {success && (
          <div className="auth-success" role="status">
            <span key={success}>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="currentPassword">
              {/* keyed span: label text changes based on mustChangePassword */}
              <span key={isMustChange ? 'tmp' : 'cur'}>
                {isMustChange ? 'Temporary password' : 'Current password'}
              </span>
            </label>
            <input
              id="currentPassword" name="currentPassword"
              type={showPw ? 'text' : 'password'} className="auth-input"
              value={form.currentPassword} onChange={change}
              placeholder="Enter current / temporary password"
              autoComplete="current-password" disabled={loading} autoFocus
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="newPassword">New password</label>
            <div className="auth-input-wrap">
              <input
                id="newPassword" name="newPassword"
                type={showPw ? 'text' : 'password'} className="auth-input"
                value={form.newPassword} onChange={change}
                placeholder="Min. 8 characters"
                autoComplete="new-password" disabled={loading}
              />
              <button
                type="button" className="auth-toggle-pw"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                <span key={showPw ? 'hide' : 'show'} aria-hidden="true">
                  {showPw ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </span>
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="confirm">Confirm new password</label>
            <input
              id="confirm" name="confirm"
              type={showPw ? 'text' : 'password'} className="auth-input"
              value={form.confirm} onChange={change}
              placeholder="Repeat new password"
              autoComplete="new-password" disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="auth-btn auth-btn--primary"
            disabled={loading}
          >
            <span key={loading ? 'loading' : 'idle'}>
              {loading ? 'Updating…' : 'Update Password'}
            </span>
          </button>
        </form>
      </div>
    </div>
  )
}
