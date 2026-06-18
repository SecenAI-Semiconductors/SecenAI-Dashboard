import { icons } from '../../components/ui/icons'
import { InstallButton } from '../../pwa/InstallButton'

const farmerFeatures = [
  {
    id: 'soil-intelligence',
    title: 'Soil Intelligence',
    desc: 'Real-time soil health metrics including pH, moisture, and nutrient levels.',
    icon: icons.soil,
  },
  {
    id: 'weather-irrigation',
    title: 'Weather & Irrigation',
    desc: 'Live weather forecasts and smart irrigation scheduling.',
    icon: icons.weather,
  },
  {
    id: 'drone-pest-detection',
    title: 'Drone Pest Detection',
    desc: 'AI-powered aerial pest detection and crop health monitoring.',
    icon: icons.drone,
  },
  {
    id: 'market-intelligence',
    title: 'Market Intelligence',
    desc: 'Current market prices, demand forecasts, and trade insights.',
    icon: icons.market,
  },
  {
    id: 'crop-insurance',
    title: 'Crop Insurance',
    desc: 'Insurance coverage details, claim tracking, and policy management.',
    icon: icons.insurance,
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    desc: 'Your personal farming assistant for queries and recommendations.',
    icon: icons.ai,
  },
]

export function FarmerDashboard({ onBack }) {
  return (
    <div className="dashboard-view" id="farmer-dashboard">
      {/* Top bar */}
      <nav className="dashboard-topbar">
        <div className="topbar-left">
          <div className="topbar-brand-icon">S</div>
          <span className="topbar-title">Farmer Dashboard</span>
        </div>
        <div className="topbar-right">
          <InstallButton />
          <button
            type="button"
            className="topbar-back-btn"
            onClick={onBack}
            id="farmer-back-button"
          >
            ← Back
          </button>
        </div>
      </nav>

      {/* Content */}
      <section className="dashboard-content">
        <h1 className="dashboard-heading">Your Farm Tools</h1>
        <p className="dashboard-subheading">
          Everything you need to manage your farm efficiently.
        </p>

        <div className="feature-cards">
          {farmerFeatures.map((f) => (
            <div
              key={f.id}
              id={f.id}
              className="feature-card feature-card--farmer"
            >
              <div className="feature-card-icon">{f.icon}</div>
              <span className="feature-card-title">{f.title}</span>
              <span className="feature-card-desc">{f.desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
