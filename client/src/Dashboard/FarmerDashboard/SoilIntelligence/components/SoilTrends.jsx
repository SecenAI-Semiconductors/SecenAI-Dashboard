import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { calculateHealthScore } from '../utils/soilThresholds'

function formatChartDate(dateString) {
  const d = new Date(dateString)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export function SoilTrends({ history }) {
  if (!history || history.length < 2) {
    return (
      <section className="si-section si-trends-section">
        <div className="si-section-header">
          <span className="si-section-icon">📈</span>
          <h2>Soil Trends</h2>
        </div>
        <div className="si-trends-empty glass-card">
          <span className="si-empty-icon">📊</span>
          <p>Historical soil data will appear here as more measurements are collected.</p>
        </div>
      </section>
    )
  }

  // Reverse history so oldest is first for the chart (left to right)
  const chartData = [...history].reverse().map(reading => ({
    date: formatChartDate(reading.recordedAt),
    fullDate: new Date(reading.recordedAt).toLocaleDateString(),
    moisture: reading.moisture,
    ph: reading.ph,
    score: Math.round(calculateHealthScore(reading).score),
  }))

  return (
    <section className="si-section si-trends-section">
      <div className="si-section-header">
        <span className="si-section-icon">📈</span>
        <h2>Soil Trends</h2>
      </div>

      <div className="si-charts-grid">
        <div className="si-chart-card glass-card">
          <h3>Health Score & Moisture</h3>
          <div className="si-chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="date" stroke="#8a9a8a" fontSize={12} tickLine={false} />
                <YAxis stroke="#8a9a8a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 600, color: '#1a2e1a', marginBottom: '8px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                <Line 
                  type="monotone" 
                  name="Health Score"
                  dataKey="score" 
                  stroke="#22783c" 
                  strokeWidth={3}
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  name="Moisture (%)"
                  dataKey="moisture" 
                  stroke="#2b6cb0" 
                  strokeWidth={3}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="si-chart-card glass-card">
          <h3>Soil pH</h3>
          <div className="si-chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="date" stroke="#8a9a8a" fontSize={12} tickLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#8a9a8a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  name="pH Level"
                  dataKey="ph" 
                  stroke="#d69e2e" 
                  strokeWidth={3}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  )
}
