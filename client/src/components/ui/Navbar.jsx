/**
 * Navbar.jsx
 *
 * Shared navigation bar rendered once across all pages via the
 * AppLayout wrapper. Auto-configures title and right-side action
 * based on the current route:
 *
 *   /farmer or /admin  → Sign Out button
 *   /farmer/* or /admin/*  → ← Back button (to dashboard root)
 *   anything else  → nothing
 */

import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LanguageSwitcher } from './LanguageSwitcher'
import { InstallButton } from '../../pwa/InstallButton'
import { icons } from './icons'
import './Navbar.css'

/* ── Route → navbar title mapping ── */
const ROUTE_TITLES = {
  '/':                            'SecenAI',
  '/admin':                       'Admin Dashboard',
  '/admin/farmer-management':     'Farmer Management',
  '/admin/crop-yield-analytics':  'Crop & Yield Analytics',
  '/admin/crop-insurance':        'Crop Insurance Management',
  '/admin/drone-operations':      'Drone Operations',
  '/admin/disease-analytics':     'Disease Analytics',
  '/admin/settings':              'Account Settings',
  '/farmer':                      'Farmer Dashboard',
  '/farmer/drone-pest-detection': 'Drone Pest Detection',
  '/farmer/market-intelligence':  'Market Intelligence',
  '/farmer/weather-intelligence': 'Weather Intelligence',
  '/farmer/ai-assistant':         'AI Assistant',
  '/farmer/crop-insurance':       'Crop Insurance',
  '/farmer/soil-intelligence':    'Soil Intelligence',
  '/farmer/settings':             'Account Settings',
}

function getNavAction(pathname) {
  if (pathname === '/farmer' || pathname === '/admin') {
    return { type: 'signout' }
  }
  if (pathname.startsWith('/farmer/')) {
    return { type: 'back', to: '/farmer' }
  }
  if (pathname.startsWith('/admin/')) {
    return { type: 'back', to: '/admin' }
  }
  return { type: 'none' }
}

export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const title = ROUTE_TITLES[location.pathname] ?? 'SecenAI'
  const action = getNavAction(location.pathname)

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
          onClick={() => {
            if (location.pathname.startsWith('/admin')) navigate('/admin')
            else if (location.pathname.startsWith('/farmer')) navigate('/farmer')
            else navigate('/')
          }}
          title="Go to dashboard"
          role="link"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              if (location.pathname.startsWith('/admin')) navigate('/admin')
              else if (location.pathname.startsWith('/farmer')) navigate('/farmer')
              else navigate('/')
            }
          }}
          aria-label="Go to dashboard"
        >
          S
        </div>
        <span className="topbar-title">{title}</span>
      </div>

      {/* ── Right: Language, Install, Settings, Back / Sign Out ── */}
      <div className="topbar-right">
        <LanguageSwitcher />
        <InstallButton />
        {action.type === 'back' && (
          <button
            type="button"
            className="topbar-back-btn"
            onClick={() => navigate(action.to)}
            id="navbar-back-button"
          >
            ← Back
          </button>
        )}
        {action.type === 'signout' && (
          <>
            <button
              type="button"
              className="topbar-back-btn topbar-settings-btn"
              onClick={() => navigate(
                location.pathname.startsWith('/admin') ? '/admin/settings' : '/farmer/settings'
              )}
              id="navbar-settings-button"
              title="Account settings"
            >
              <span className="navbar-settings-icon" aria-hidden="true">{icons.settings}</span>
              <span>Settings</span>
            </button>
            <button
              type="button"
              className="topbar-back-btn topbar-signout-btn"
              onClick={logout}
              id="navbar-signout-button"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
