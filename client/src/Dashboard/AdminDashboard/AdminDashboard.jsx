import { useNavigate } from 'react-router-dom'
import { icons } from '../../components/ui/icons'
import { InstallButton } from '../../pwa/InstallButton'

const adminFeatures = [
  {
    id: 'farmer-field-mgmt',
    title: 'Farmer & Field Management',
    desc: 'Manage farmer profiles, field records, and onboarding workflows.',
    icon: icons.farmerMgmt,
    route: '/admin/farmer-management',
  },
  {
    id: 'drone-operations',
    title: 'Drone Operations',
    desc: 'Schedule flights, monitor drone fleets, and review mission logs.',
    icon: icons.droneOps,
    route: null,
  },
  {
    id: 'crop-yield-analytics',
    title: 'Crop & Yield Analytics',
    desc: 'Track crop performance, harvest forecasts, and yield comparisons.',
    icon: icons.cropYield,
    route: null,
  },
  {
    id: 'disease-pest-analytics',
    title: 'Disease & Pest Analytics',
    desc: 'Analyze outbreak patterns, risk heat-maps, and treatment effectiveness.',
    icon: icons.disease,
    route: null,
  },
]

export function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <div className="dashboard-view" id="admin-dashboard">
      {/* Top bar */}
      <nav className="dashboard-topbar">
        <div className="topbar-left">
          <div
            className="topbar-brand-icon"
            onClick={() => navigate('/')}
            title="Go to home"
            style={{ cursor: 'pointer' }}
          >
            S
          </div>
          <span className="topbar-title">Admin Dashboard</span>
        </div>
        <div className="topbar-right">
          <InstallButton />
          <button
            type="button"
            className="topbar-back-btn"
            onClick={() => navigate('/')}
            id="admin-back-button"
          >
            ← Back
          </button>
        </div>
      </nav>

      {/* Content */}
      <section className="dashboard-content">
        <h1 className="dashboard-heading">Platform Management</h1>
        <p className="dashboard-subheading">
          Monitor operations and manage the agriculture platform.
        </p>

        <div className="feature-cards">
          {adminFeatures.map((f) => (
            <div
              key={f.id}
              id={f.id}
              className={`feature-card feature-card--admin${f.route ? ' feature-card--clickable' : ''}`}
              onClick={f.route ? () => navigate(f.route) : undefined}
              style={f.route ? { cursor: 'pointer' } : undefined}
            >
              <div className="feature-card-icon">{f.icon}</div>
              <span className="feature-card-title">{f.title}</span>
              <span className="feature-card-desc">{f.desc}</span>
              {f.route && (
                <span className="feature-card-arrow">
                  Manage →
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
