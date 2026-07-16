import { useNavigate } from 'react-router-dom'
import { icons } from '../components/ui/icons'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <main className="home-page" id="home-page">
      <header className="home-header">
        <div className="home-brand">
          <div className="home-brand-icon">S</div>
          <span className="home-brand-name">SecenAI</span>
        </div>
        <h1 className="home-title">Agriculture Dashboard</h1>
        <p className="home-subtitle">
          Select your portal to access tools and insights for smarter farming.
        </p>
      </header>

      <div className="portal-cards">
        {/* Admin Card */}
        <button
          id="admin-portal-card"
          className="portal-card portal-card--admin"
          onClick={() => navigate('/admin')}
          type="button"
        >
          <div className="portal-icon">{icons.settings}</div>
          <h2 className="portal-title">Admin Dashboard</h2>
          <p className="portal-description">
            Manage farmers, monitor drone ops, and analyze crop data across the platform.
          </p>
          <span className="portal-arrow">
            Continue
            {icons.arrow}
          </span>
        </button>

        {/* Farmer Card */}
        <button
          id="farmer-portal-card"
          className="portal-card portal-card--farmer"
          onClick={() => navigate('/farmer')}
          type="button"
        >
          <div className="portal-icon">{icons.farmer}</div>
          <h2 className="portal-title">Farmer Dashboard</h2>
          <p className="portal-description">
            Access soil data, weather insights, pest alerts, and your AI farming assistant.
          </p>
          <span className="portal-arrow">
            Continue
            {icons.arrow}
          </span>
        </button>
      </div>

      <footer className="home-footer">
        <p>&copy; {new Date().getFullYear()} SecenAI. All rights reserved.</p>
      </footer>
    </main>
  )
}
