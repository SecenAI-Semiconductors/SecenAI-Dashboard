import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher'
import './AuthPages.css'

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

export function RegisterPage() {
  const navigate    = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = useState({
    name: '', phone: '', password: '', district: '', state: '',
  })
  const [showPw,   setShowPw]   = useState(false)
  const [errors,   setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [loading,  setLoading]  = useState(false)

  function change(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim())    e.name     = 'Full name is required'
    if (!form.phone.trim())   e.phone    = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, '').replace(/^(91|0)/, '')))
      e.phone = 'Enter a valid 10-digit Indian mobile number'
    if (!form.password)       e.password = 'Password is required'
    else if (form.password.length < 8)
      e.password = 'Password must be at least 8 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setApiError('')
    setLoading(true)
    try {
      const { user } = await register({
        name:     form.name.trim(),
        phone:    form.phone.trim(),
        password: form.password,
        district: form.district.trim() || undefined,
        state:    form.state           || undefined,
      })

      navigate(user.mustChangePassword ? '/change-password' : '/farmer', { replace: true })
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">

        {/* Language switcher — visible before registration */}
        <div className="auth-lang-row">
          <LanguageSwitcher />
        </div>

        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">S</div>
          <span className="auth-brand-name" translate="no">SecenAI</span>
        </div>

        <h1 className="auth-title">Create Farmer Account</h1>
        <p className="auth-subtitle">Sign up to access your farm tools</p>

        {/* API error — keyed span prevents GTranslate removeChild crash on message change */}
        {apiError && (
          <div className="auth-error" role="alert">
            <span key={apiError}>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-form-grid">

            {/* Full Name */}
            <div className="auth-field auth-field--full">
              <label className="auth-label" htmlFor="name">Full Name *</label>
              <input
                id="name" name="name" type="text"
                className={`auth-input${errors.name ? ' auth-input--err' : ''}`}
                value={form.name} onChange={change}
                placeholder="Enter your full name"
                disabled={loading} autoFocus
              />
              {/* Validation errors: keyed span so GTranslate font tag is discarded on change */}
              {errors.name && (
                <span className="auth-field-err" key={errors.name}>{errors.name}</span>
              )}
            </div>

            {/* Phone — translate="no" on input so example phone numbers aren't touched */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="phone">Phone Number *</label>
              <input
                id="phone" name="phone" type="tel"
                className={`auth-input${errors.phone ? ' auth-input--err' : ''}`}
                value={form.phone} onChange={change}
                placeholder="9876543210"
                translate="no"
                disabled={loading}
              />
              {errors.phone && (
                <span className="auth-field-err" key={errors.phone}>{errors.phone}</span>
              )}
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="password">Password *</label>
              <div className="auth-input-wrap">
                <input
                  id="password" name="password"
                  type={showPw ? 'text' : 'password'}
                  className={`auth-input${errors.password ? ' auth-input--err' : ''}`}
                  value={form.password} onChange={change}
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
              {errors.password && (
                <span className="auth-field-err" key={errors.password}>{errors.password}</span>
              )}
            </div>

            {/* District (optional) */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="district">
                District <span className="auth-optional">(optional)</span>
              </label>
              <input
                id="district" name="district" type="text" className="auth-input"
                value={form.district} onChange={change} placeholder="e.g. Dharwad"
                disabled={loading}
              />
            </div>

            {/* State (optional) */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="state">
                State <span className="auth-optional">(optional)</span>
              </label>
              <select id="state" name="state" className="auth-input auth-select"
                value={form.state} onChange={change} disabled={loading}>
                <option value="">Select state</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="auth-btn auth-btn--primary auth-btn--mt"
            disabled={loading}
          >
            <span key={loading ? 'loading' : 'idle'}>
              {loading ? 'Creating account…' : 'Create Account'}
            </span>
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
