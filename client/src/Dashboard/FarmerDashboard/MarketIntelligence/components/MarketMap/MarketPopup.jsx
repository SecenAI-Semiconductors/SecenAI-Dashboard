/**
 * MarketPopup.jsx
 *
 * Card-style popup displayed when a marker is clicked.
 * Shows full market details: name, location, commodity,
 * all three price points, arrival date, and a "View Details" button.
 */

import { Popup } from 'react-leaflet'

function formatPrice(val) {
  const n = Number(val)
  if (!Number.isFinite(n)) return '—'
  return `₹${n.toLocaleString('en-IN')}`
}

export function MarketPopup({ market, isBest }) {
  return (
    <Popup className="mm-popup" maxWidth={280} minWidth={240}>
      <div className="mm-popup-card">
        {/* Accent bar */}
        <div className={`mm-popup-accent${isBest ? ' mm-popup-accent--best' : ''}`} />

        <div className="mm-popup-body">
          {/* Header */}
          <div className="mm-popup-header">
            <span className="mm-popup-name">{market.market}</span>
            {isBest && (
              <span className="mm-popup-badge">
                ⭐ Best Market
              </span>
            )}
          </div>

          {/* Location */}
          <div className="mm-popup-location">
            📍 {market.district}, {market.state}
          </div>

          {/* Commodity */}
          <div className="mm-popup-commodity">
            🌾 {market.commodity}
          </div>

          {/* Prices */}
          <div className="mm-popup-prices">
            <div className="mm-popup-price">
              <span className="mm-popup-price-label">Modal</span>
              <span className="mm-popup-price-value mm-popup-price-value--modal">
                {formatPrice(market.modalPrice)}
              </span>
            </div>
            <div className="mm-popup-price">
              <span className="mm-popup-price-label">Min</span>
              <span className="mm-popup-price-value mm-popup-price-value--min">
                {formatPrice(market.minPrice)}
              </span>
            </div>
            <div className="mm-popup-price">
              <span className="mm-popup-price-label">Max</span>
              <span className="mm-popup-price-value mm-popup-price-value--max">
                {formatPrice(market.maxPrice)}
              </span>
            </div>
          </div>

          {/* Date */}
          <div className="mm-popup-date">
            📅 Arrival: {market.arrivalDate}
          </div>

          {/* View Details */}
          <button
            type="button"
            className="mm-popup-details-btn"
            onClick={() => {
              /* Placeholder for future navigation */
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View Details
          </button>
        </div>
      </div>
    </Popup>
  )
}
