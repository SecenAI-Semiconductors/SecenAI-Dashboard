/**
 * LoadingMap.jsx
 *
 * Displayed while market locations are being geocoded.
 * Shows animated progress with count.
 */

export function LoadingMap({ progress, total }) {
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0

  return (
    <div className="mm-loading" id="market-map-loading">
      <div className="mm-loading-icon">📍</div>
      <div className="mm-loading-title">Locating markets…</div>
      <div className="mm-loading-subtitle">
        Geocoding market locations across India
      </div>
      <div className="mm-loading-progress-bar">
        <div
          className="mm-loading-progress-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mm-loading-count">
        {progress} / {total} locations resolved ({pct}%)
      </div>
    </div>
  )
}
