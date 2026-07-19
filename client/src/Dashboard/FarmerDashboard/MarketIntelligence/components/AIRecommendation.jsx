/**
 * AIRecommendation.jsx
 *
 * Static AI recommendation card.
 * Uses CSS classes from MarketIntelligence.css.
 */

export function AIRecommendation() {
  return (
    <section className="mi-section" id="ai-recommendation-section">
      <div className="mi-section-header">
        <span className="mi-section-icon">🤖</span>
        <h2 className="mi-section-title">AI Recommendation</h2>
      </div>
      <p className="mi-section-subtitle">
        Intelligent insights based on market analysis and price trends.
      </p>

      <div className="ai-card">
        <div className="ai-accent" />
        <div className="ai-body">
          {/* Header */}
          <div className="ai-header">
            <div className="ai-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="ai-header-text">
              <div className="ai-title-row">
                <span className="ai-title">Market Analysis</span>
                <span className="ai-badge">
                  <span className="ai-badge-dot" />
                  AI Powered
                </span>
              </div>
              <p className="ai-desc">
                Cotton prices have remained strong over the last few days. Market trends indicate
                stable demand with limited supply in major mandis.
              </p>
            </div>
          </div>

          {/* Recommended Action */}
          <div className="ai-action-box">
            <div className="ai-action-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Recommended Action
            </div>
            <p className="ai-action-text">
              Hold your stock for another 3–5 days if immediate cash flow is not required.
              Prices are expected to remain stable or increase slightly based on current trends.
            </p>
          </div>

          {/* Metrics */}
          <div className="ai-metrics">
            {/* Confidence */}
            <div className="ai-metric">
              <div className="ai-confidence-ring">
                <svg viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(34,120,60,0.10)" strokeWidth="4" />
                  <circle
                    cx="22" cy="22" r="18" fill="none"
                    stroke="#2e9e50" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 18 * 0.87} ${2 * Math.PI * 18}`}
                  />
                </svg>
                <span className="ai-confidence-value">87%</span>
              </div>
              <div className="ai-metric-text">
                <span className="ai-metric-label">Confidence</span>
                <span className="ai-metric-val">High</span>
              </div>
            </div>

            <div className="ai-divider" />

            {/* Last Updated */}
            <div className="ai-metric">
              <div className="ai-metric-text">
                <span className="ai-metric-label">Last Updated</span>
                <span className="ai-metric-val">Today</span>
              </div>
            </div>

            <div className="ai-divider" />

            {/* Trend */}
            <div className="ai-metric">
              <div className="ai-trend-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <div className="ai-metric-text">
                <span className="ai-metric-label">Trend</span>
                <span className="ai-metric-val ai-metric-val--green">Bullish</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
