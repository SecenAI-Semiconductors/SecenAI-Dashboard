/**
 * MapLegend.jsx
 *
 * Floating legend fixed on the map showing marker color meanings.
 * Semi-transparent with backdrop blur (glassmorphism).
 */

export function MapLegend() {
  return (
    <div className="mm-legend" id="market-map-legend">
      <div className="mm-legend-title">Legend</div>
      <div className="mm-legend-items">
        <div className="mm-legend-item">
          <span className="mm-legend-dot mm-legend-dot--high" />
          High Price
        </div>
        <div className="mm-legend-item">
          <span className="mm-legend-dot mm-legend-dot--medium" />
          Medium Price
        </div>
        <div className="mm-legend-item">
          <span className="mm-legend-dot mm-legend-dot--low" />
          Low Price
        </div>
        <div className="mm-legend-item">
          <span className="mm-legend-dot mm-legend-dot--best" />
          ⭐ Best Market
        </div>
      </div>
    </div>
  )
}
