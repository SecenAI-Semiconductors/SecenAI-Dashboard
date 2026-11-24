/**
 * AdminSettingsPage.jsx
 *
 * /admin/settings — admin-only, role-protected.
 * Sections: Profile (name, email + current password to change email), Change Password, Sign Out.
 * All errors/success wrapped in keyed <span> for Google Translate safety.
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './AuthPages.css'
import './SettingsPage.css'

export function AdminSettingsPage() {
  const { user, setUser, logout } = useAuth()

  // ── Profile section ──
  const [profile, setProfile] = useState({
    name:            user?.name     || user?.fullName || '',
    email:           user?.email    || '',
    currentPassword: '',
  })
  // Track whether the user deliberately edited the email field
  const [emailTouched, setEmailTouched] = useState(false)
  const [profileError,   setProfileError]   = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  // Sync form when user session loads
  useEffect(() => {
    if (user) {
      setProfile(p => ({
        ...p,
        name:  p.name  || user.name || user.fullName || '',
        email: user.email || p.email || '',
      }))
      setEmailTouched(false)
    }
  }, [user])

  // ── Password section ──
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [showPw, setShowPw]   = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  function changeProfile(e) {
    const { name, value } = e.target
    setProfile(p => ({ ...p, [name]: value }))
    if (name === 'email') setEmailTouched(true)
    setProfileError('')
    setProfileSuccess('')
  }

  async function handleProfileSave(e) {
    e.preventDefault()
    if (!profile.name.trim()) { setProfileError('Name cannot be empty.'); return }

    // Email change requires current password
    const userEmail = (user?.email || '').trim().toLowerCase()
    const inputEmail = profile.email.trim().toLowerCase()
    const emailChanged = emailTouched && inputEmail !== '' && inputEmail !== userEmail

    if (emailChanged && !profile.currentPassword) {
      setProfileError('Enter your current password to change email.'); return
    }

    setProfileLoading(true)
    try {
      const body = { name: profile.name.trim() }
      if (emailChanged) {
        body.email = profile.email.trim()
        body.currentPassword = profile.currentPassword
      }

      const res = await api.put('/api/admin/me', body)
      setUser(u => ({ ...u, name: res.data.name, fullName: res.data.name, email: res.data.email }))
      setProfileSuccess('Profile saved successfully.')
      setProfileError('')
      setProfile(p => ({ ...p, currentPassword: '' }))
      setEmailTouched(false)
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to save profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault()
    if (!pw.currentPassword || !pw.newPassword || !pw.confirm) {
      setPwError('All fields are required.'); return
    }
    if (pw.newPassword.length < 8) { setPwError('New password must be at least 8 characters.'); return }
    if (pw.newPassword !== pw.confirm) { setPwError('Passwords do not match.'); return }
    if (pw.newPassword === pw.currentPassword) {
      setPwError('New password must be different from current password.'); return
    }

    setPwLoading(true)
    try {
      await api.post('/api/auth/change-password', {
        currentPassword: pw.currentPassword,
        newPassword:     pw.newPassword,
      })
      setUser(u => ({ ...u, mustChangePassword: false }))
      setPwSuccess('Password updated successfully.')
      setPwError('')
      setPw({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to update password.')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-container">

        {/* Header */}
        <div className="settings-header">
          <h1 className="settings-title">Account Settings</h1>
          <p className="settings-subtitle">Manage your admin profile and account security.</p>
        </div>

        {/* ── SECTION 1: Profile ── */}
        <section className="settings-section">
          <h2 className="settings-section-title">Profile</h2>

          {profileError && (
            <div className="auth-error" role="alert">
              <span key={profileError}>{profileError}</span>
            </div>
          )}
          {profileSuccess && (
            <div className="auth-success" role="status">
              <span key={profileSuccess}>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleProfileSave} noValidate style={{ maxWidth: 480 }}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="admin-settings-name">Full Name *</label>
              <input id="admin-settings-name" name="name" type="text" className="auth-input"
                value={profile.name} onChange={changeProfile}
                disabled={profileLoading} placeholder="Admin name" />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="admin-settings-email">Email *</label>
              <input id="admin-settings-email" name="email" type="email" className="auth-input"
                value={profile.email} onChange={changeProfile}
                disabled={profileLoading} placeholder="admin@secenai.com" />
            </div>

            {/* Current password required only when email is being changed */}
            {emailTouched && profile.email.trim().toLowerCase() !== (user?.email || '').trim().toLowerCase() && (
              <div className="auth-field">
                <label className="auth-label" htmlFor="admin-settings-curpw">
                  Current password <span className="auth-optional">(required to change email)</span>
                </label>
                <input id="admin-settings-curpw" name="currentPassword"
                  type="password" className="auth-input"
                  value={profile.currentPassword} onChange={changeProfile}
                  disabled={profileLoading} autoComplete="current-password" />
              </div>
            )}

            <button type="submit" className="auth-btn auth-btn--primary settings-save-btn"
              disabled={profileLoading}>
              <span key={profileLoading ? 'saving' : 'save'}>
                {profileLoading ? 'Saving…' : 'Save Profile'}
              </span>
            </button>
          </form>
        </section>

        {/* ── SECTION 2: Change Password ── */}
        <section className="settings-section">
          <h2 className="settings-section-title">Change Password</h2>

          {pwError && (
            <div className="auth-error" role="alert">
              <span key={pwError}>{pwError}</span>
            </div>
          )}
          {pwSuccess && (
            <div className="auth-success" role="status">
              <span key={pwSuccess}>{pwSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSave} noValidate style={{ maxWidth: 400 }}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="admin-curpw">Current password</label>
              <div className="auth-input-wrap">
                <input id="admin-curpw" name="currentPassword"
                  type={showPw ? 'text' : 'password'} className="auth-input"
                  value={pw.currentPassword}
                  onChange={e => { setPw(p => ({ ...p, currentPassword: e.target.value })); setPwError('') }}
                  autoComplete="current-password" disabled={pwLoading} />
                <button type="button" className="auth-toggle-pw" onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'} tabIndex={-1}>
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
              <label className="auth-label" htmlFor="admin-newpw">New password</label>
              <input id="admin-newpw" name="newPassword"
                type={showPw ? 'text' : 'password'} className="auth-input"
                value={pw.newPassword}
                onChange={e => { setPw(p => ({ ...p, newPassword: e.target.value })); setPwError('') }}
                autoComplete="new-password" disabled={pwLoading} placeholder="Min. 8 characters" />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="admin-confirm">Confirm new password</label>
              <input id="admin-confirm" name="confirm"
                type={showPw ? 'text' : 'password'} className="auth-input"
                value={pw.confirm}
                onChange={e => { setPw(p => ({ ...p, confirm: e.target.value })); setPwError('') }}
                autoComplete="new-password" disabled={pwLoading} placeholder="Repeat new password" />
            </div>

            <button type="submit" className="auth-btn auth-btn--primary" disabled={pwLoading}>
              <span key={pwLoading ? 'updating' : 'update'}>
                {pwLoading ? 'Updating…' : 'Update Password'}
              </span>
            </button>
          </form>
        </section>

        {/* ── SECTION 3: Sign Out ── */}
        <section className="settings-section settings-section--danger">
          <h2 className="settings-section-title">Sign Out</h2>
          <p className="settings-signout-desc">You will be returned to the login page.</p>
          <button type="button" className="settings-signout-btn" onClick={logout}>
            Sign Out
          </button>
        </section>

      </div>
    </div>
  )
}

