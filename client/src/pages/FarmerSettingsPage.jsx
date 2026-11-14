/**
 * FarmerSettingsPage.jsx
 *
 * /farmer/settings — farmer-only, role-protected.
 * Sections: Profile, Account (phone read-only + change password), Sign Out.
 * Uses AuthPages.css tokens. LanguageSwitcher in Navbar (already there).
 * All errors/success messages wrapped in keyed <span> for Google Translate safety.
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher'
import api from '../services/api'
import './AuthPages.css'
import './SettingsPage.css'

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu','Delhi',
  'Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
]

const CROP_OPTIONS = [
  'Rice (Paddy)','Groundnut','Cotton','Maize','Chilli',
  'Sugarcane','Turmeric','Redgram (Tur)','Wheat','Soybean',
]

const SEASON_OPTIONS = ['Kharif','Rabi','Zaid','Year-round']

function emptyCrop() {
  return { name: '', area: '', season: '' }
}

export function FarmerSettingsPage() {
  const { user, setUser, logout } = useAuth()

  // ── Profile section ──
  const [profile, setProfile] = useState({
    name: '', village: '', district: '', state: '',
    totalLandArea: '', email: '',
  })
  const [crops, setCrops] = useState([emptyCrop()])
  const [profileError, setProfileError]   = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  // ── Password section ──
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [showPw, setShowPw]   = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  // ── Load profile from server ──
  useEffect(() => {
    api.get('/api/farmer/me/profile').then(res => {
      const d = res.data
      setProfile({
        name:          d.name          || '',
        village:       d.village       || '',
        district:      d.district      || '',
        state:         d.state         || '',
        totalLandArea: d.totalLandArea || '',
        email:         d.email         || '',
      })
      if (d.crops?.length) {
        setCrops(d.crops.map(c => ({ name: c.name || '', area: c.area || '', season: c.season || '' })))
      }
    }).catch(() => {})
  }, [])

  function changeProfile(e) {
    const { name, value } = e.target
    setProfile(p => ({ ...p, [name]: value }))
    setProfileError('')
    setProfileSuccess('')
  }

  function changeCrop(idx, field, value) {
    setCrops(cs => cs.map((c, i) => i === idx ? { ...c, [field]: value } : c))
    setProfileError('')
  }

  function addCrop() { setCrops(cs => [...cs, emptyCrop()]) }

  function removeCrop(idx) {
    setCrops(cs => cs.length === 1 ? [emptyCrop()] : cs.filter((_, i) => i !== idx))
  }

  async function handleProfileSave(e) {
    e.preventDefault()
    if (!profile.name.trim()) { setProfileError('Name is required.'); return }
    if (profile.totalLandArea && Number(profile.totalLandArea) <= 0) {
      setProfileError('Total land area must be greater than 0.'); return
    }

    // Validate crops
    const validCrops = crops.filter(c => c.name && String(c.area).trim())
    for (const c of validCrops) {
      if (Number(c.area) <= 0) { setProfileError('Each crop area must be greater than 0.'); return }
    }

    setProfileLoading(true)
    try {
      const body = {
        name:    profile.name.trim(),
        village: profile.village.trim()  || undefined,
        district: profile.district.trim() || undefined,
        state:   profile.state            || undefined,
        email:   profile.email.trim()     || undefined,
      }
      if (profile.totalLandArea) body.totalLandArea = Number(profile.totalLandArea)
      if (validCrops.length > 0) {
        body.crops = validCrops.map(c => ({
          name:   c.name,
          area:   Number(c.area),
          season: c.season || undefined,
        }))
      }

      const res = await api.put('/api/farmer/me/profile', body)
      setUser(u => ({ ...u, ...res.data, name: res.data.name, fullName: res.data.name }))
      setProfileSuccess('Profile saved successfully.')
      setProfileError('')
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
          <div className="settings-header-left">
            <h1 className="settings-title">Account Settings</h1>
            <p className="settings-subtitle">Manage your profile and account security.</p>
          </div>
          <LanguageSwitcher />
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

          <form onSubmit={handleProfileSave} noValidate>
            <div className="auth-form-grid">
              <div className="auth-field auth-field--full">
                <label className="auth-label" htmlFor="settings-name">Full Name *</label>
                <input id="settings-name" name="name" type="text" className="auth-input"
                  value={profile.name} onChange={changeProfile}
                  disabled={profileLoading} placeholder="Your full name" />
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="settings-email">
                  Email <span className="auth-optional">(optional)</span>
                </label>
                <input id="settings-email" name="email" type="email" className="auth-input"
                  value={profile.email} onChange={changeProfile}
                  disabled={profileLoading} placeholder="your@email.com" />
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="settings-village">
                  Village <span className="auth-optional">(optional)</span>
                </label>
                <input id="settings-village" name="village" type="text" className="auth-input"
                  value={profile.village} onChange={changeProfile}
                  disabled={profileLoading} placeholder="Your village" />
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="settings-district">
                  District <span className="auth-optional">(optional)</span>
                </label>
                <input id="settings-district" name="district" type="text" className="auth-input"
                  value={profile.district} onChange={changeProfile}
                  disabled={profileLoading} placeholder="e.g. Warangal" />
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="settings-state">
                  State <span className="auth-optional">(optional)</span>
                </label>
                <select id="settings-state" name="state" className="auth-input auth-select"
                  value={profile.state} onChange={changeProfile} disabled={profileLoading}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="settings-land">
                  Total Land Area (acres) <span className="auth-optional">(optional)</span>
                </label>
                <input id="settings-land" name="totalLandArea" type="number" min="0.1" step="0.1"
                  className="auth-input" value={profile.totalLandArea} onChange={changeProfile}
                  disabled={profileLoading} placeholder="e.g. 5.5" />
              </div>
            </div>

            {/* Crops */}
            <div className="settings-crops-section">
              <div className="settings-crops-header">
                <span className="auth-label" style={{ marginBottom: 0 }}>
                  Crops <span className="auth-optional">(optional)</span>
                </span>
                <button type="button" className="settings-add-crop-btn" onClick={addCrop}
                  disabled={profileLoading}>+ Add Crop</button>
              </div>

              {crops.map((crop, idx) => (
                <div key={idx} className="settings-crop-row">
                  <select className="auth-input auth-select settings-crop-name"
                    value={crop.name}
                    onChange={e => changeCrop(idx, 'name', e.target.value)}
                    disabled={profileLoading}>
                    <option value="">Select crop</option>
                    {CROP_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <input type="number" min="0.1" step="0.1" className="auth-input settings-crop-area"
                    placeholder="Area (ac)"
                    value={crop.area}
                    onChange={e => changeCrop(idx, 'area', e.target.value)}
                    disabled={profileLoading} />

                  <select className="auth-input auth-select settings-crop-season"
                    value={crop.season}
                    onChange={e => changeCrop(idx, 'season', e.target.value)}
                    disabled={profileLoading}>
                    <option value="">Season</option>
                    {SEASON_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <button type="button" className="settings-remove-crop-btn"
                    onClick={() => removeCrop(idx)} disabled={profileLoading}
                    aria-label="Remove crop">×</button>
                </div>
              ))}
            </div>

            <button type="submit" className="auth-btn auth-btn--primary settings-save-btn"
              disabled={profileLoading}>
              <span key={profileLoading ? 'saving' : 'save'}>
                {profileLoading ? 'Saving…' : 'Save Profile'}
              </span>
            </button>
          </form>
        </section>

        {/* ── SECTION 2: Account ── */}
        <section className="settings-section">
          <h2 className="settings-section-title">Account</h2>

          {/* Phone — read-only */}
          <div className="settings-readonly-field">
            <label className="auth-label">Phone Number</label>
            <div className="settings-readonly-value">
              <span translate="no">{user?.phone || '—'}</span>
              <span className="settings-readonly-note">Contact admin to change your phone number.</span>
            </div>
          </div>

          {/* Change password */}
          <h3 className="settings-subsection-title">Change Password</h3>

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
              <label className="auth-label" htmlFor="settings-curpw">Current password</label>
              <div className="auth-input-wrap">
                <input id="settings-curpw" name="currentPassword"
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
              <label className="auth-label" htmlFor="settings-newpw">New password</label>
              <input id="settings-newpw" name="newPassword"
                type={showPw ? 'text' : 'password'} className="auth-input"
                value={pw.newPassword}
                onChange={e => { setPw(p => ({ ...p, newPassword: e.target.value })); setPwError('') }}
                autoComplete="new-password" disabled={pwLoading}
                placeholder="Min. 8 characters" />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="settings-confirm">Confirm new password</label>
              <input id="settings-confirm" name="confirm"
                type={showPw ? 'text' : 'password'} className="auth-input"
                value={pw.confirm}
                onChange={e => { setPw(p => ({ ...p, confirm: e.target.value })); setPwError('') }}
                autoComplete="new-password" disabled={pwLoading}
                placeholder="Repeat new password" />
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

