import { useNavigate } from 'react-router-dom'
import { icons } from '../../components/ui/icons'

const farmerFeatures = [
  {
    id: 'soil-intelligence',
    title: 'Soil Intelligence',
    desc: 'Real-time soil health metrics including pH, moisture, and nutrient levels.',
    icon: icons.soil,
    route: null,
  },
  {
    id: 'weather-irrigation',
    title: 'Weather & Irrigation',
    desc: 'Live weather forecasts and smart irrigation scheduling.',
    icon: icons.weather,
    route: null,
  },
  {
    id: 'drone-pest-detection',
    title: 'Drone Pest Detection',
    desc: 'AI-powered aerial pest detection and crop health monitoring.',
    icon: icons.drone,
    route: '/farmer/drone-pest-detection',
  },
  {
    id: 'market-intelligence',
    title: 'Market Intelligence',
    desc: 'Current market prices, demand forecasts, and trade insights.',
    icon: icons.market,
    route: null,
  },
  {
    id: 'crop-insurance',
    title: 'Crop Insurance',
    desc: 'Insurance coverage details, claim tracking, and policy management.',
    icon: icons.insurance,
    route: null,
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    desc: 'Your personal farming assistant for queries and recommendations.',
    icon: icons.ai,
    route: null,
  },
]

export function FarmerDashboard() {
  const navigate = useNavigate()

  return (
    <div className="dashboard-view" id="farmer-dashboard">
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
              className={`feature-card feature-card--farmer${f.route ? ' feature-card--clickable' : ''}`}
              onClick={f.route ? () => navigate(f.route) : undefined}
              style={f.route ? { cursor: 'pointer' } : undefined}
            >
              <div className="feature-card-icon">{f.icon}</div>
              <span className="feature-card-title">{f.title}</span>
              <span className="feature-card-desc">{f.desc}</span>
              {f.route && (
                <span className="feature-card-arrow">
                  View Analysis →
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
