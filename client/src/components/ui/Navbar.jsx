/**
 * Navbar.jsx
 *
 * Shared navigation bar rendered once across all pages via the
 * AppLayout wrapper. Auto-configures title and back-button
 * destination based on the current route.
 *
 * Usage: Rendered by AppLayout in App.jsx — no manual imports needed.
 */

import { useNavigate, useLocation } from 'react-router-dom'
import { LanguageSwitcher } from './LanguageSwitcher'
import { InstallButton } from '../../pwa/InstallButton'
import './Navbar.css'

/* ── Route → navbar config mapping ── */
const ROUTE_CONFIG = {
  '/':                            { title: 'SecenAI',              backTo: null },
  '/admin':                       { title: 'Admin Dashboard',      backTo: '/' },
  '/admin/farmer-management':     { title: 'Farmer Management',    backTo: '/admin' },
  '/farmer':                      { title: 'Farmer Dashboard',     backTo: '/' },
  '/farmer/drone-pest-detection': { title: 'Drone Pest Detection', backTo: '/farmer' },
}

/* Fallback for unknown routes */
const DEFAULT_CONFIG = { title: 'SecenAI', backTo: '/' }

export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const config = ROUTE_CONFIG[location.pathname] || DEFAULT_CONFIG

  return (
    <nav
      className="dashboard-topbar"
      role="navigation"
      aria-label="Main navigation"
      id="main-navbar"
    >
      {/* ── Left: Brand + Title ── */}
      <div className="topbar-left">
        <div
          className="topbar-brand-icon"
          onClick={() => navigate('/')}
          title="Go to home"
          role="link"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              navigate('/')
            }
          }}
          aria-label="Go to home"
        >
          S
        </div>
        <span className="topbar-title">{config.title}</span>
      </div>

      {/* ── Right: Language, Install, Back ── */}
      <div className="topbar-right">
        <LanguageSwitcher />
        <InstallButton />
        {config.backTo && (
          <button
            type="button"
            className="topbar-back-btn"
            onClick={() => navigate(config.backTo)}
            id="navbar-back-button"
          >
            ← Back
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar
