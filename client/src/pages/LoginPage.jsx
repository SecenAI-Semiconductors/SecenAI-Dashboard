import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher'
import './AuthPages.css'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!identifier.trim() || !password) {
      setError('Please enter your email or phone number and password.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const { user } = await login(identifier.trim(), password)

      if (user.mustChangePassword) {
        navigate('/change-password', { replace: true })
        return
      }

      const from = location.state?.from?.pathname
      const dest = from && from !== '/login'
        ? from
        : user.role === 'admin' ? '/admin' : '/farmer'

      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Language switcher — visible before login, top-right of card */}
        <div className="auth-lang-row">
          <LanguageSwitcher />
        </div>

        {/* Brand — translate="no" so "SecenAI" is never mangled */}
        <div className="auth-brand">
          <div className="auth-brand-icon">S</div>
          <span className="auth-brand-name" translate="no">SecenAI</span>
        </div>

        <h1 className="auth-title">Sign In</h1>
        <p className="auth-subtitle">Enter your email or phone number to continue</p>

        {/*
          Wrap error text in a keyed <span> so that when the error string changes,
          React remounts the <span> and discards any <font> tag GTranslate injected,
          preventing removeChild / insertBefore crashes.
        */}
        {error && (
          <div className="auth-error" role="alert">
            <span key={error}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="identifier" className="auth-label">
              Email or phone number
            </label>
            {/* translate="no" keeps example values (email/phone) untouched */}
            <input
              id="identifier"
              type="text"
              className="auth-input"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder="email@example.com or 9876543210"
              translate="no"
              autoComplete="username"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password" className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                className="auth-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="auth-toggle-pw"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {/* key forces span remount on toggle — clears GTranslate <font> wrapper */}
                <span key={showPw ? 'hide' : 'show'} aria-hidden="true">
                  {showPw ? (
                    /* eye-off */
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    /* eye */
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-btn auth-btn--primary"
            disabled={loading}
          >
            {/* key forces span remount on loading state change */}
            <span key={loading ? 'loading' : 'idle'}>
              {loading ? 'Signing in…' : 'Sign In'}
            </span>
          </button>
        </form>

        <p className="auth-footer-text">
          New farmer?{' '}
          <Link to="/register" className="auth-link">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
