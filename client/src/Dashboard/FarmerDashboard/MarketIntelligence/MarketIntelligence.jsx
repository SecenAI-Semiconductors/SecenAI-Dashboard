/**
 * MarketIntelligence.jsx
 *
 * Page orchestrator for the Market Intelligence dashboard.
 * Fetches data once via useMarketData hook, then distributes
 * derived data to each section component.
 *
 * Sections (in order):
 *   1. Best Selling Opportunities (hero)
 *   2. AI Recommendation (static)
 *   3. Price Trend Chart
 *   4. Nearby Markets
 *   5. All Market Prices (full table)
 */

import { useState } from 'react'
import { useMarketData } from './hooks/useMarketData'
import { BestSellingCards } from './components/BestSellingCards'
import { AIRecommendation } from './components/AIRecommendation'
import { PriceTrendChart } from './components/PriceTrendChart'
import { MarketMap } from './components/MarketMap/MarketMap'
import { MarketTable } from './components/MarketTable'
import {
  SkeletonHero,
  SkeletonAI,
  SkeletonChart,
  SkeletonTable,
} from './components/LoadingSkeleton'
import './MarketIntelligence.css'

const noApiKey = !import.meta.env.VITE_AGMARKNET_API_KEY

export function MarketIntelligence() {
  const {
    rawRecords,
    topMarkets,
    chartData,
    nearbyMarkets,
    loading,
    error,
    commodity,
    setCommodity,
    stateFilter,
    setStateFilter,
    refetch,
  } = useMarketData('Wheat')

  // Commodity input for the global filter
  const [commodityInput, setCommodityInput] = useState(commodity)

  const handleCommoditySearch = (e) => {
    e.preventDefault()
    if (commodityInput.trim()) {
      setCommodity(commodityInput.trim())
    }
  }

  return (
    <div className="market-intel-page" id="market-intelligence-page">
      <section className="market-intel-content">
        {/* ──── Page Header ──── */}
        <div className="mi-page-header">
          <div className="mi-page-title-row">
            <span className="mi-page-chip">🌾 Live mandi insights</span>
          </div>
          <h1 className="mi-page-title">Market Intelligence</h1>
          <p className="mi-page-subtitle">
            Live commodity prices from AGMARKNET — India's Agricultural Marketing
            Information Network. Analyze trends, find the best markets, and make
            data-driven selling decisions.
          </p>
        </div>

        {/* ──── API Key Warning ──── */}
        {noApiKey && (
          <div className="mi-api-warning" id="market-api-warning">
            <span className="mi-api-warning-icon">⚠️</span>
            <div className="mi-api-warning-text">
              <strong>API Key Required:</strong> To fetch live mandi prices, add your free
              data.gov.in API key to the <code>.env</code> file as{' '}
              <code>VITE_AGMARKNET_API_KEY=your_key</code>. Register at{' '}
              <a
                href="https://data.gov.in"
                target="_blank"
                rel="noopener noreferrer"
              >
                data.gov.in
              </a>{' '}
              to get a key (it's free and instant).
            </div>
          </div>
        )}

        {/* ──── Global Commodity Selector ──── */}
        <form onSubmit={handleCommoditySearch} className="mi-global-filters">
          <div className="mi-filter-group">
            <label className="mi-filter-label">Commodity</label>
            <input
              type="text"
              value={commodityInput}
              onChange={(e) => setCommodityInput(e.target.value)}
              placeholder="e.g. Wheat, Rice, Cotton"
              className="mi-filter-input"
              id="global-commodity-input"
            />
          </div>
          <div className="mi-filter-group">
            <label className="mi-filter-label">State</label>
            <input
              type="text"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              placeholder="e.g. Maharashtra"
              className="mi-filter-input"
              id="global-state-input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mi-search-btn"
            id="global-search-btn"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {loading ? 'Loading…' : 'Search'}
          </button>
        </form>

        {/* ──── Error State ──── */}
        {error && !loading && (
          <div className="mi-error-card">
            <div className="mi-empty-state">
              <div className="mi-error-icon">⚠️</div>
              <div className="mi-empty-title">Unable to load market prices.</div>
              <div className="mi-empty-msg">{error}</div>
              <button
                type="button"
                onClick={refetch}
                className="mi-retry-btn"
                id="market-retry-btn"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* ──── Loading State ──── */}
        {loading && (
          <>
            <SkeletonHero />
            <SkeletonAI />
            <SkeletonChart />
            <SkeletonTable />
          </>
        )}

        {/* ──── Content Sections ──── */}
        {!loading && !error && (
          <>
            {/* Section 1: Best Selling Opportunities */}
            <BestSellingCards markets={topMarkets} />

            {/* Section 2: AI Recommendation */}
            <AIRecommendation />

            {/* Section 3: Price Trend */}
            <PriceTrendChart chartData={chartData} />

            {/* Section 4: Market Map (replaces Nearby Markets) */}
            <MarketMap records={rawRecords} />

            {/* Section 5: All Market Prices */}
            <MarketTable records={rawRecords} />
          </>
        )}
      </section>
    </div>
  )
}
