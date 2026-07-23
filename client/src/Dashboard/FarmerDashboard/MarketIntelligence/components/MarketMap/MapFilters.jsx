/**
 * MapFilters.jsx
 *
 * Filter bar + search bar above the map.
 * Dropdowns for Commodity, State, District, Market.
 * Search bar with autocomplete that zooms the map.
 */

import { useState, useMemo, useRef, useEffect } from 'react'

export function MapFilters({
  records,
  filters,
  onFilterChange,
  onSearchSelect,
  geocodedMarkets,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)

  // Derive unique filter options from all records (not filtered)
  const options = useMemo(() => {
    const commodities = new Set()
    const states = new Set()
    const districts = new Set()
    const markets = new Set()

    for (const r of records) {
      if (r.commodity) commodities.add(r.commodity)
      if (r.state) states.add(r.state)
      if (r.district) districts.add(r.district)
      if (r.market) markets.add(r.market)
    }

    return {
      commodities: [...commodities].sort(),
      states: [...states].sort(),
      districts: [...districts].sort(),
      markets: [...markets].sort(),
    }
  }, [records])

  // Search results — match geocoded markets by name/district/state
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return geocodedMarkets
      .filter(
        (m) =>
          m.market.toLowerCase().includes(q) ||
          m.district.toLowerCase().includes(q) ||
          m.state.toLowerCase().includes(q),
      )
      .slice(0, 8) // Limit dropdown to 8 results
  }, [searchQuery, geocodedMarkets])

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelectResult(market) {
    setSearchQuery(`${market.market}, ${market.district}`)
    setShowResults(false)
    onSearchSelect?.(market)
  }

  function handleClearAll() {
    onFilterChange({ commodity: '', state: '', district: '', market: '' })
    setSearchQuery('')
  }

  const hasActiveFilters =
    filters.commodity || filters.state || filters.district || filters.market

  return (
    <div className="mm-filters-bar" id="market-map-filters">
      {/* Commodity */}
      <div className="mm-filter-group">
        <label className="mm-filter-label">Commodity</label>
        <select
          className="mm-filter-select"
          value={filters.commodity}
          onChange={(e) =>
            onFilterChange({ ...filters, commodity: e.target.value })
          }
        >
          <option value="">All Commodities</option>
          {options.commodities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* State */}
      <div className="mm-filter-group">
        <label className="mm-filter-label">State</label>
        <select
          className="mm-filter-select"
          value={filters.state}
          onChange={(e) =>
            onFilterChange({ ...filters, state: e.target.value })
          }
        >
          <option value="">All States</option>
          {options.states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* District */}
      <div className="mm-filter-group">
        <label className="mm-filter-label">District</label>
        <select
          className="mm-filter-select"
          value={filters.district}
          onChange={(e) =>
            onFilterChange({ ...filters, district: e.target.value })
          }
        >
          <option value="">All Districts</option>
          {options.districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Market */}
      <div className="mm-filter-group">
        <label className="mm-filter-label">Market</label>
        <select
          className="mm-filter-select"
          value={filters.market}
          onChange={(e) =>
            onFilterChange({ ...filters, market: e.target.value })
          }
        >
          <option value="">All Markets</option>
          {options.markets.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className="mm-search-group" ref={searchRef}>
        <label className="mm-filter-label">Search</label>
        <div className="mm-search-wrapper">
          <svg
            className="mm-search-icon"
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
          <input
            type="text"
            className="mm-search-input"
            placeholder="Search market, district, state…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => setShowResults(true)}
            id="market-map-search"
          />
          {showResults && searchResults.length > 0 && (
            <div className="mm-search-results">
              {searchResults.map((m, i) => (
                <div
                  key={`${m.market}-${m.district}-${i}`}
                  className="mm-search-result-item"
                  onClick={() => handleSelectResult(m)}
                >
                  <div className="mm-search-result-name">{m.market}</div>
                  <div className="mm-search-result-location">
                    {m.district}, {m.state}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          type="button"
          className="mm-clear-btn"
          onClick={handleClearAll}
        >
          Clear All
        </button>
      )}
    </div>
  )
}
