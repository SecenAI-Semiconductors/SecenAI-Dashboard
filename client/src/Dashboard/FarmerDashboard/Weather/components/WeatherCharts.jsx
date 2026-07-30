import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const chartConfig = {
  hourly: [
    { dataKey: 'temp', label: 'Temperature (°C)', color: '#2e9e50' },
    { dataKey: 'humidity', label: 'Humidity (%)', color: '#3b82f6' },
    { dataKey: 'pop', label: 'Rain Chance (%)', color: '#0ea5e9' },
    { dataKey: 'windSpeed', label: 'Wind Speed (km/h)', color: '#f97316' },
  ],
  daily: [
    { dataKey: 'maxTemp', label: 'Max Temp (°C)', color: '#16a34a' },
    { dataKey: 'minTemp', label: 'Min Temp (°C)', color: '#22c55e' },
    { dataKey: 'humidity', label: 'Humidity (%)', color: '#38bdf8' },
    { dataKey: 'pop', label: 'Rain Chance (%)', color: '#0ea5e9' },
  ],
}

export function WeatherCharts({ hourly, daily, chartMode, setChartMode }) {
  const chartItems = chartConfig[chartMode]
  const chartData = useMemo(() => (chartMode === 'daily' ? daily : hourly), [chartMode, daily, hourly])

  return (
    <section className="weather-section">
      <div className="section-heading-row">
        <div>
          <h2>Interactive Weather Charts</h2>
          <span>Hourly and daily trend analysis</span>
        </div>
        <div className="chart-toggle-group">
          <button
            type="button"
            className={`chart-toggle ${chartMode === 'hourly' ? 'active' : ''}`}
            onClick={() => setChartMode('hourly')}
          >
            Hourly
          </button>
          <button
            type="button"
            className={`chart-toggle ${chartMode === 'daily' ? 'active' : ''}`}
            onClick={() => setChartMode('daily')}
          >
            Daily
          </button>
        </div>
      </div>

      <div className="charts-grid">
        {chartItems.map((item) => (
          <article key={item.dataKey} className="chart-card glass-card">
            <div className="chart-card-header">
              <span>{item.label}</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`color-${item.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={item.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={item.color} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5f7ed" />
                  <XAxis dataKey={chartMode === 'daily' ? 'day' : 'time'} stroke="#4b5563" />
                  <YAxis stroke="#4b5563" />
                  <Tooltip />
                  <Area type="monotone" dataKey={item.dataKey} stroke={item.color} fillOpacity={1} fill={`url(#color-${item.dataKey})`} animationDuration={800} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
