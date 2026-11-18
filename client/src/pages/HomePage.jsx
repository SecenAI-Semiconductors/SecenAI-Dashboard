import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher'
import { icons } from '../components/ui/icons'

const farmerFeatures = [
  ['weather', 'Weather and irrigation'],
  ['soil', 'Soil intelligence'],
  ['drone', 'Drone pest detection'],
  ['market', 'Market prices'],
  ['insurance', 'Crop insurance'],
  ['ai', 'AI farming assistant'],
]

const adminFeatures = [
  ['farmerMgmt', 'Farmer and field management'],
  ['droneOps', 'Drone operations'],
  ['cropYield', 'Crop and yield analytics'],
  ['disease', 'Disease and pest analytics'],
  ['insurance', 'Insurance management'],
]

function FeatureList({ title, features, variant }) {
  return (
    <article className={`home-feature-group home-feature-group--${variant}`}>
      <h3 className="home-feature-title"><span>{title}</span></h3>
      <ul className="home-feature-list">
        {features.map(([icon, label]) => (
          <li key={label}>
            <span className="home-feature-icon" aria-hidden="true">{icons[icon]}</span>
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { user, token, loading } = useAuth()

  if (loading) return null

  if (token && user) {
    if (user.mustChangePassword) return <Navigate to="/change-password" replace />
    const home = user.role === 'admin' ? '/admin' : user.role === 'farmer' ? '/farmer' : '/'
    return <Navigate to={home} replace />
  }

  return (
    <main className="home-page" id="home-page">
      <header className="home-header">
        <div className="home-nav-bar">
          <div className="home-nav">
            <a className="home-brand" href="/" aria-label="SecenAI home">
              <span className="home-brand-icon" aria-hidden="true">S</span>
              <span className="home-brand-name" translate="no">SecenAI</span>
            </a>
            <div className="home-nav-actions">
              <LanguageSwitcher />
              <button className="home-sign-in" type="button" onClick={() => navigate('/login')}>
                <span>Sign In</span>
              </button>
            </div>
          </div>
        </div>

        <div className="home-hero">
          <div className="home-hero-copy">
            <span className="home-eyebrow"><span>Smarter farming starts here</span></span>
            <h1 className="home-title">
              <span>AI-powered agriculture for Indian farmers</span>
            </h1>
            <p className="home-subtitle">
              <span>Practical intelligence for healthier crops, better decisions, and more resilient farms.</span>
            </p>
            <div className="home-hero-actions">
              <div className="home-action-group">
                <button className="home-primary-button" type="button" onClick={() => navigate('/login')}>
                  <span>I'm a Farmer</span>
                  <span aria-hidden="true">{icons.arrow}</span>
                </button>
                <button className="home-register-link" type="button" onClick={() => navigate('/register')}>
                  <span>New farmer? Create an account</span>
                </button>
              </div>
              <button className="home-secondary-button" type="button" onClick={() => navigate('/login')}>
                <span>I'm an Admin</span>
                <span aria-hidden="true">{icons.arrow}</span>
              </button>
            </div>
          </div>
          <div className="home-hero-art" aria-hidden="true">
            <div className="home-art-glow" />
            <div className="home-art-card home-art-card--weather">
              <span className="home-art-icon">{icons.weather}</span>
              <span><strong>Weather</strong><small>Field-ready insights</small></span>
            </div>
            <div className="home-art-card home-art-card--soil">
              <span className="home-art-icon">{icons.soil}</span>
              <span><strong>Soil health</strong><small>Smarter crop decisions</small></span>
            </div>
            <svg className="home-field-illustration" viewBox="0 0 480 440" fill="none">
              <path className="home-art-sun" d="M365 84a44 44 0 1 0 0-88 44 44 0 0 0 0 88Z" />
              <path className="home-art-hill home-art-hill--back" d="M0 245c88-69 145-54 224-8 78 46 149 42 256-39v242H0V245Z" />
              <path className="home-art-hill home-art-hill--front" d="M0 310c101-65 182-53 258-8 76 45 137 42 222-15v153H0V310Z" />
              <path className="home-art-row" d="M40 377c97-42 215-43 357 0M75 411c92-31 185-31 300 0M142 440c62-16 132-16 202 0" />
              <path className="home-art-plant" d="M236 354v-95m0 32c-25-24-48-25-65-17 19 24 39 31 65 27m0-14c24-24 47-25 64-17-18 23-38 30-64 26m0-13c-15-23-17-43-6-61 20 19 20 39 6 61Z" />
            </svg>
            <div className="home-art-badge"><span>{icons.ai}</span><span>AI farming assistant</span></div>
          </div>
        </div>
      </header>

      <section className="home-section home-capabilities" aria-labelledby="capabilities-title">
        <div className="home-section-heading">
          <span className="home-eyebrow"><span>One platform, two perspectives</span></span>
          <h2 id="capabilities-title"><span>What it does</span></h2>
          <p><span>Connected tools that help farmers act with confidence and administrators see the bigger picture.</span></p>
        </div>
        <div className="home-feature-grid">
          <FeatureList title="For farmers" features={farmerFeatures} variant="farmer" />
          <FeatureList title="For admins" features={adminFeatures} variant="admin" />
        </div>
      </section>

      <section className="home-section home-steps" aria-labelledby="steps-title">
        <div className="home-section-heading">
          <span className="home-eyebrow"><span>Simple to get started</span></span>
          <h2 id="steps-title"><span>How it works</span></h2>
        </div>
        <ol className="home-step-list">
          <li>
            <span className="home-step-number">01</span>
            <span className="home-step-icon">{icons.farmer}</span>
            <span className="home-step-copy"><strong>Register</strong><small>Create your account in a few simple steps.</small></span>
          </li>
          <li>
            <span className="home-step-number">02</span>
            <span className="home-step-icon">{icons.soil}</span>
            <span className="home-step-copy"><strong>Add your farm details</strong><small>Tell us about your fields and crops.</small></span>
          </li>
          <li>
            <span className="home-step-number">03</span>
            <span className="home-step-icon">{icons.ai}</span>
            <span className="home-step-copy"><strong>Get insights</strong><small>Use timely intelligence to plan your next move.</small></span>
          </li>
        </ol>
      </section>

      <footer className="home-footer">
        <div className="home-footer-content">
          <div className="home-footer-intro">
            <a
              className="home-footer-brand"
              href="https://secenai.com"
              target="_blank"
              rel="noreferrer"
              translate="no"
            >
              <span className="home-footer-mark" aria-hidden="true">S</span>
              <span>SecenAI</span>
            </a>
            <p>AI-powered agriculture intelligence for healthier crops, better decisions, and more resilient farms.</p>
            <a className="home-footer-website" href="https://secenai.com" target="_blank" rel="noreferrer">
              <span>Visit secenai.com</span>
              <span aria-hidden="true">{icons.arrow}</span>
            </a>
            <div className="home-footer-socials" aria-label="SecenAI social links">
              <a href="https://www.linkedin.com/company/135216664/admin/dashboard/" target="_blank" rel="noreferrer" aria-label="SecenAI on LinkedIn">in</a>
              <a href="https://www.youtube.com/@SECENAI" target="_blank" rel="noreferrer" aria-label="SecenAI on YouTube">▶</a>
            </div>
          </div>
          <div className="home-footer-column">
            <h2><span>Platform</span></h2>
            <a href="/login">Farmer Intelligence</a>
            <a href="/login">AI Analytics</a>
            <a href="/login">Drone Operations</a>
            <a href="/login">Market Insights</a>
          </div>
          <div className="home-footer-column">
            <h2><span>Solutions</span></h2>
            <a href="/login">Precision Agriculture</a>
            <a href="/login">Soil and Crop Health</a>
            <a href="/login">Pest Detection</a>
            <a href="/login">Crop Insurance</a>
          </div>
          <div className="home-footer-contact">
            <h2><span>Contact</span></h2>
            <a href="mailto:info@secenai.com">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
              <span>info@secenai.com</span>
            </a>
            <a href="tel:+919573091962">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5 9 3l2 5-2.2 1.8a15 15 0 0 0 5.4 5.4L16 13l5 2-2.4 2.4a3 3 0 0 1-3.1-.2A18.5 18.5 0 0 1 4.8 6.6 3 3 0 0 1 6.6 3.5Z" /></svg>
              <span>+91 95730 91962</span>
            </a>
            <a href="https://maps.google.com/?q=Hyderabad%2C%20India" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
              <span>Hyderabad, India</span>
            </a>
          </div>
        </div>
        <div className="home-footer-bottom">
          <span>© {new Date().getFullYear()} SecenAI. All rights reserved.</span>
          <span>Built for smarter growing seasons.</span>
        </div>
      </footer>
    </main>
  )
}
