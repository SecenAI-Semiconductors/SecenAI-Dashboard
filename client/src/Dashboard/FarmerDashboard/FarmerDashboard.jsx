import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { icons } from '../../components/ui/icons'
import { useAuth } from '../../context/AuthContext'

const farmerFeatures = [
  {
    id: 'soil-intelligence',
    title: 'Soil Intelligence',
    desc: 'Real-time soil health metrics including pH, moisture, and nutrient levels.',
    icon: icons.soil,
    route: '/farmer/soil-intelligence',
  },
  {
    id: 'weather-irrigation',
    title: 'Weather & Irrigation',
    desc: 'Live weather forecasts and smart irrigation scheduling.',
    icon: icons.weather,
    route: '/farmer/weather-intelligence',
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
    route: '/farmer/market-intelligence',
  },
  {
    id: 'crop-insurance',
    title: 'Crop Insurance',
    desc: 'Insurance coverage details, claim tracking, and policy management.',
    icon: icons.insurance,
    route: '/farmer/crop-insurance',
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    desc: 'Your personal farming assistant for queries and recommendations.',
    icon: icons.ai,
    route: '/farmer/ai-assistant',
  },
]

export function FarmerDashboard() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  // Redirect to complete-profile only when auth has fully loaded AND the farmer
  // has never set up their profile at all (no land area AND no crops).
  // Having crops OR a non-zero land area means the profile is set up — don't interrupt.
  useEffect(() => {
    if (loading) return   // wait for session-restore to finish

    const hasLand  = user?.totalLandArea && user.totalLandArea > 0
    const hasCrops = user?.crops && user.crops.length > 0
    const skipped  = sessionStorage.getItem('profile_skipped')

    if (user && user.role === 'farmer' && !hasLand && !hasCrops && !skipped) {
      navigate('/complete-profile', { replace: true })
    }
  }, [user, loading, navigate])

  return (
    <div className="dashboard-view" id="farmer-dashboard">
      {/* Content */}
      <section className="dashboard-content">
        {/* Header */}
        <div>
          <h1 className="dashboard-heading">Your Farm Tools</h1>
          <p className="dashboard-subheading">
            {user?.name ? `Welcome, ${user.name}. ` : ''}Everything you need to manage your farm efficiently.
          </p>
        </div>

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
                  View Analysis &rarr;
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
