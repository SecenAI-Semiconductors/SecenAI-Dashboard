import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher'
import api from '../services/api'
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

export function CompleteProfilePage() {
  const navigate     = useNavigate()
  const { setUser }  = useAuth()

  const [form, setForm] = useState({
    totalLandArea: '', village: '', district: '', state: '',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function change(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.totalLandArea || Number(form.totalLandArea) <= 0) {
      setError('Please enter your total land area in acres.')
      return
    }

    setLoading(true)
    try {
      const res = await api.put('/api/farmer/me/profile', {
        totalLandArea: Number(form.totalLandArea),
        village:   form.village.trim()  || undefined,
        district:  form.district.trim() || undefined,
        state:     form.state           || undefined,
      })
      setUser(u => ({ ...u, ...res.data }))
      sessionStorage.setItem('profile_skipped', '1')
      navigate('/farmer', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">

        {/* Language switcher — farmer sees this before their dashboard */}
        <div className="auth-lang-row">
          <LanguageSwitcher />
        </div>

        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">S</div>
          <span className="auth-brand-name" translate="no">SecenAI</span>
        </div>

        <h1 className="auth-title">Complete Your Profile</h1>
        <p className="auth-subtitle">
          Help us personalise your experience with a few details about your farm.
        </p>

        {error && (
          <div className="auth-error" role="alert">
            <span key={error}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-form-grid">
            <div className="auth-field auth-field--full">
              <label className="auth-label" htmlFor="totalLandArea">
                Total Land Area (acres) *
              </label>
              <input
                id="totalLandArea" name="totalLandArea" type="number" min="0.1" step="0.1"
                className="auth-input" value={form.totalLandArea} onChange={change}
                placeholder="e.g. 5.5" disabled={loading} autoFocus
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="village">
                Village <span className="auth-optional">(optional)</span>
              </label>
              <input id="village" name="village" type="text" className="auth-input"
                value={form.village} onChange={change} placeholder="Your village name"
                disabled={loading} />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="district">
                District <span className="auth-optional">(optional)</span>
              </label>
              <input id="district" name="district" type="text" className="auth-input"
                value={form.district} onChange={change} placeholder="e.g. Dharwad"
                disabled={loading} />
            </div>

            <div className="auth-field auth-field--full">
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
              {loading ? 'Saving…' : 'Save & Continue'}
            </span>
          </button>
        </form>

        <p className="auth-footer-text">
          <button
            className="auth-link auth-link--btn"
            onClick={() => {
              sessionStorage.setItem('profile_skipped', '1')
              navigate('/farmer', { replace: true })
            }}
          >
            Skip for now
          </button>
        </p>
      </div>
    </div>
  )
}
