/**
 * Filters.jsx
 *
 * Reusable filter bar for MI sections.
 * Uses CSS classes from MarketIntelligence.css.
 */

import { useState, useCallback } from 'react'

export function Filters({ fields, onFilter, searchPlaceholder, onSearch, compact = false }) {
  const [values, setValues] = useState(() =>
    fields.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {}),
  )
  const [searchText, setSearchText] = useState('')

  const handleChange = useCallback(
    (key, value) => {
      const next = { ...values, [key]: value }
      setValues(next)
      onFilter?.(next)
    },
    [values, onFilter],
  )

  const handleSearch = useCallback(
    (value) => {
      setSearchText(value)
      onSearch?.(value)
    },
    [onSearch],
  )

  const handleClear = useCallback(() => {
    const cleared = fields.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {})
    setValues(cleared)
    setSearchText('')
    onFilter?.(cleared)
    onSearch?.('')
  }, [fields, onFilter, onSearch])

  const hasActiveFilters =
    Object.values(values).some((v) => v.trim()) || searchText.trim()

  return (
    <div className="mi-filters-row" style={compact ? { marginBottom: 14 } : undefined}>
      {/* Search */}
      {searchPlaceholder && (
        <div className="mi-filter-group mi-search-group">
          <label className="mi-filter-label">Search</label>
          <div className="mi-search-wrapper">
            <svg
              className="mi-search-icon"
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
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="mi-search-input"
            />
          </div>
        </div>
      )}

      {/* Filter fields */}
      {fields.map((f) => (
        <div key={f.key} className="mi-filter-group">
          <label className="mi-filter-label">{f.label}</label>
          <input
            type="text"
            value={values[f.key]}
            onChange={(e) => handleChange(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="mi-filter-input"
            style={{ minWidth: 0 }}
          />
        </div>
      ))}

      {/* Clear */}
      {hasActiveFilters && (
        <button type="button" onClick={handleClear} className="mi-clear-btn">
          Clear
        </button>
      )}
    </div>
  )
}
