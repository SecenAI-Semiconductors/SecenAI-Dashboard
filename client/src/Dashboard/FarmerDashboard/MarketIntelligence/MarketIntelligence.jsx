import { useState, useCallback } from 'react'
import { fetchMandiPrices } from '../../../services/agmarknetService'
import './MarketIntelligence.css'

const ITEMS_PER_PAGE = 10

export function MarketIntelligence() {

  // Filter state
  const [commodity, setCommodity] = useState('')
  const [state, setState] = useState('')
  const [district, setDistrict] = useState('')
  const [market, setMarket] = useState('')

  // Data state
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)

  // UI state
  const [status, setStatus] = useState('initial') // initial | loading | success | error | empty
  const [errorMsg, setErrorMsg] = useState('')
  const [noApiKey, setNoApiKey] = useState(!import.meta.env.VITE_AGMARKNET_API_KEY)

  const doSearch = useCallback(
    async (newOffset = 0) => {
      setStatus('loading')
      setErrorMsg('')

      try {
        const data = await fetchMandiPrices({
          commodity,
          state,
          district,
          market,
          limit: ITEMS_PER_PAGE,
          offset: newOffset,
        })

        setRecords(data.records)
        setTotal(data.total)
        setOffset(newOffset)
        setStatus(data.records.length > 0 ? 'success' : 'empty')
      } catch (err) {
        setErrorMsg(err.message || 'Failed to fetch mandi prices.')
        setStatus('error')
      }
    },
    [commodity, state, district, market],
  )

  const handleSearch = (e) => {
    e.preventDefault()
    doSearch(0)
  }

  const handleClear = () => {
    setCommodity('')
    setState('')
    setDistrict('')
    setMarket('')
    setRecords([])
    setTotal(0)
    setOffset(0)
    setStatus('initial')
  }

  const handlePrev = () => {
    if (offset >= ITEMS_PER_PAGE) {
      doSearch(offset - ITEMS_PER_PAGE)
    }
  }

  const handleNext = () => {
    if (offset + ITEMS_PER_PAGE < total) {
      doSearch(offset + ITEMS_PER_PAGE)
    }
  }

  const currentPage = Math.floor(offset / ITEMS_PER_PAGE) + 1
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))

  return (
    <div className="market-intel-page" id="market-intelligence-page">

      {/* ──── Content ──── */}
      <section className="market-intel-content">
        {/* Page header */}
        <div className="market-page-header">
          <h1 className="market-page-title">Mandi Prices</h1>
          <p className="market-page-subtitle">
            Live commodity prices from AGMARKNET — India's Agricultural Marketing Information Network.
            Search by commodity, state, district, or market to view latest mandi rates.
          </p>
        </div>

        {/* API key warning */}
        {noApiKey && (
          <div className="market-api-warning" id="market-api-warning">
            <span className="market-api-warning-icon">⚠️</span>
            <div className="market-api-warning-text">
              <strong>API Key Required:</strong> To fetch live mandi prices, add your free
              data.gov.in API key to the <code>.env</code> file as{' '}
              <code>VITE_AGMARKNET_API_KEY=your_key</code>. Register at{' '}
              <a href="https://data.gov.in" target="_blank" rel="noopener noreferrer">
                data.gov.in
              </a>{' '}
              to get a key (it's free and instant).
            </div>
          </div>
        )}

        {/* ──── Filters ──── */}
        <form className="market-filters-card" onSubmit={handleSearch} id="market-filters">
          <div className="market-filters-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter Prices
          </div>

          <div className="market-filters-grid">
            <div className="market-filter-group">
              <label className="market-filter-label" htmlFor="filter-commodity">Commodity</label>
              <input
                id="filter-commodity"
                className="market-filter-input"
                type="text"
                placeholder="e.g. Wheat, Rice, Tomato"
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
              />
            </div>
            <div className="market-filter-group">
              <label className="market-filter-label" htmlFor="filter-state">State</label>
              <input
                id="filter-state"
                className="market-filter-input"
                type="text"
                placeholder="e.g. Maharashtra"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
            <div className="market-filter-group">
              <label className="market-filter-label" htmlFor="filter-district">District</label>
              <input
                id="filter-district"
                className="market-filter-input"
                type="text"
                placeholder="e.g. Pune"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>
            <div className="market-filter-group">
              <label className="market-filter-label" htmlFor="filter-market">Market / APMC</label>
              <input
                id="filter-market"
                className="market-filter-input"
                type="text"
                placeholder="e.g. Pune(Moshi)"
                value={market}
                onChange={(e) => setMarket(e.target.value)}
              />
            </div>
          </div>

          <div className="market-filters-actions">
            <button
              type="submit"
              className="market-search-btn"
              disabled={status === 'loading'}
              id="market-search-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {status === 'loading' ? 'Searching…' : 'Search Prices'}
            </button>
            <button
              type="button"
              className="market-clear-btn"
              onClick={handleClear}
              id="market-clear-btn"
            >
              Clear Filters
            </button>
          </div>
        </form>

        {/* ──── Results ──── */}
        <div className="market-results-card" id="market-results">

          {/* Initial state */}
          {status === 'initial' && (
            <div className="market-initial">
              <div className="market-initial-icon">📊</div>
              <div className="market-initial-title">Search Mandi Prices</div>
              <div className="market-initial-msg">
                Use the filters above to search for commodity prices across Indian mandis.
                You can search without filters to see all available data.
              </div>
            </div>
          )}

          {/* Loading state */}
          {status === 'loading' && (
            <div className="market-loading">
              <div className="market-spinner" />
              <div className="market-loading-text">Fetching mandi prices…</div>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className="market-error">
              <div className="market-error-icon">⚠️</div>
              <div className="market-error-title">Failed to Load Prices</div>
              <div className="market-error-msg">{errorMsg}</div>
              <button
                type="button"
                className="market-retry-btn"
                onClick={() => doSearch(offset)}
                id="market-retry-btn"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {status === 'empty' && (
            <div className="market-empty">
              <div className="market-empty-icon">🔍</div>
              <div className="market-empty-title">No Results Found</div>
              <div className="market-empty-msg">
                No mandi prices match your current filters. Try adjusting the commodity, state,
                district, or market name.
              </div>
            </div>
          )}

          {/* Success — data table */}
          {status === 'success' && (
            <>
              <div className="market-results-header">
                <span className="market-results-title">Market Prices</span>
                <span className="market-results-count">
                  {total.toLocaleString()} result{total !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="market-table-wrap">
                <table className="market-table" id="market-price-table">
                  <thead>
                    <tr>
                      <th>Commodity</th>
                      <th>State</th>
                      <th>District</th>
                      <th>Market / APMC</th>
                      <th>Min Price (₹/Qt)</th>
                      <th>Max Price (₹/Qt)</th>
                      <th>Modal Price (₹/Qt)</th>
                      <th>Arrival Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={`${r.commodity}-${r.market}-${r.state}-${i}`}>
                        <td className="market-commodity-cell">{r.commodity}</td>
                        <td>{r.state}</td>
                        <td>{r.district}</td>
                        <td>{r.market}</td>
                        <td className="market-price-cell market-price-cell--min">
                          ₹{Number(r.minPrice).toLocaleString('en-IN')}
                        </td>
                        <td className="market-price-cell market-price-cell--max">
                          ₹{Number(r.maxPrice).toLocaleString('en-IN')}
                        </td>
                        <td className="market-price-cell market-price-cell--modal">
                          ₹{Number(r.modalPrice).toLocaleString('en-IN')}
                        </td>
                        <td>{r.arrivalDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {total > ITEMS_PER_PAGE && (
                <div className="market-pagination">
                  <span className="market-pagination-info">
                    Page {currentPage} of {totalPages} · Showing{' '}
                    {offset + 1}–{Math.min(offset + ITEMS_PER_PAGE, total)} of{' '}
                    {total.toLocaleString()}
                  </span>
                  <div className="market-pagination-controls">
                    <button
                      type="button"
                      className="market-page-btn"
                      disabled={offset === 0 || status === 'loading'}
                      onClick={handlePrev}
                      id="market-prev-btn"
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      className="market-page-btn"
                      disabled={offset + ITEMS_PER_PAGE >= total || status === 'loading'}
                      onClick={handleNext}
                      id="market-next-btn"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
