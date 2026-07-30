/**
 * BestSellingCards.jsx
 *
 * Hero section — Top 3 markets by Modal Price.
 * Uses CSS classes from MarketIntelligence.css.
 */

function formatPrice(val) {
  const n = Number(val)
  if (!Number.isFinite(n)) return '—'
  return `₹${n.toLocaleString('en-IN')}`
}

export function BestSellingCards({ markets }) {
  if (!markets || markets.length === 0) return null

  return (
    <section className="mi-section" id="best-selling-section">
      <div className="mi-section-header">
        <span className="mi-section-icon">🏆</span>
        <h2 className="mi-section-title">Best Selling Opportunities</h2>
      </div>
      <p className="mi-section-subtitle">
        Top markets offering the highest modal prices for your selected crop.
      </p>

      <div className="bsc-grid">
        {markets.map((m, i) => (
          <div
            key={`${m.market}-${m.state}-${i}`}
            className={`bsc-card${i === 0 ? ' bsc-card--best' : ''}`}
          >
            {/* Best Price badge */}
            {i === 0 && <div className="bsc-badge">Best Price</div>}

            {/* Accent bar on #1 */}
            {i === 0 && <div className="bsc-accent-bar" />}

            <div className="bsc-body">
              {/* Rank + commodity */}
              <div className="bsc-head">
                <div className={`bsc-rank bsc-rank--${i + 1}`}>#{i + 1}</div>
                <div className="bsc-head-text">
                  <div className="bsc-commodity">{m.commodity}</div>
                  <div className="bsc-market-name">{m.market} — {m.district}</div>
                </div>
              </div>

              {/* Modal price */}
              <div className="bsc-price-label">Modal Price</div>
              <div className="bsc-modal-price">
                {formatPrice(m.modalPrice)}<span>/Qt</span>
              </div>

              {/* Min / Max */}
              <div className="bsc-prices-row">
                <div className="bsc-price-item">
                  <span className="bsc-price-item-label">Min Price</span>
                  <span className="bsc-price-item-value bsc-price-item-value--min">
                    {formatPrice(m.minPrice)}
                  </span>
                </div>
                <div className="bsc-price-item">
                  <span className="bsc-price-item-label">Max Price</span>
                  <span className="bsc-price-item-value bsc-price-item-value--max">
                    {formatPrice(m.maxPrice)}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="bsc-footer">
                <div className="bsc-meta">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="bsc-meta-text">{m.state}</span>
                </div>
                <div className="bsc-meta">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className="bsc-meta-text">{m.arrivalDate}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
