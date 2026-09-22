import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const SEVERITY_COLORS = {
  Critical: '#dc2626',
  High: '#f97316',
  Moderate: '#eab308',
  Low: '#22c55e',
}

export function RiskHeatmap({ data, loading }) {
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    setMapReady(true)
  }, [])

  if (loading) {
    return (
      <div className="da-card da-heatmap-card">
        <h2 className="da-section-title">Risk Heat Map</h2>
        <div className="da-skeleton da-skeleton--map" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="da-card da-heatmap-card">
        <h2 className="da-section-title">Risk Heat Map</h2>
        <div className="da-empty">No location data available.</div>
      </div>
    )
  }

  // Calculate center from data points
  const avgLat = data.reduce((sum, d) => sum + d.lat, 0) / data.length
  const avgLng = data.reduce((sum, d) => sum + d.lng, 0) / data.length

  return (
    <div className="da-card da-heatmap-card">
      <h2 className="da-section-title">Risk Heat Map</h2>
      <p className="da-section-subtitle">Detection locations colored by severity level</p>
      <div className="da-map-wrap">
        {mapReady && (
          <MapContainer
            center={[avgLat, avgLng]}
            zoom={5}
            style={{ height: '400px', width: '100%', borderRadius: '8px' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {data.map((point, i) => (
              <CircleMarker
                key={i}
                center={[point.lat, point.lng]}
                radius={10}
                pathOptions={{
                  fillColor: SEVERITY_COLORS[point.severity] || '#6b7280',
                  fillOpacity: 0.8,
                  color: '#fff',
                  weight: 2,
                }}
              >
                <Tooltip direction="top" offset={[0, -10]}>
                  <div style={{ fontSize: '12px', lineHeight: 1.4 }}>
                    <strong>{point.disease}</strong><br />
                    {point.fieldName} · {point.crop}<br />
                    Health: {point.healthScore}/100<br />
                    Severity: <span style={{ color: SEVERITY_COLORS[point.severity], fontWeight: 600 }}>{point.severity}</span>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>
      <div className="da-legend">
        {Object.entries(SEVERITY_COLORS).map(([label, color]) => (
          <span key={label} className="da-legend-item">
            <span className="da-legend-dot" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
