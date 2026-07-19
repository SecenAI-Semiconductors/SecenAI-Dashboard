/**
 * MarketTable.jsx
 *
 * Full dataset table with search, filters, sorting, and pagination.
 * Displays all 8 columns with sticky header and row hover effects.
 */

import { useState, useMemo, useCallback } from 'react'
import { Filters } from './Filters'

function formatPrice(val) {
  const n = Number(val)
  if (!Number.isFinite(n)) return '—'
  return `₹${n.toLocaleString('en-IN')}`
}

const ITEMS_PER_PAGE = 10

const FILTER_FIELDS = [
  { key: 'commodity', label: 'Commodity', placeholder: 'e.g. Wheat' },
  { key: 'state', label: 'State', placeholder: 'e.g. Maharashtra' },
  { key: 'district', label: 'District', placeholder: 'e.g. Pune' },
  { key: 'market', label: 'Market', placeholder: 'e.g. Pune(Moshi)' },
]

const SORT_OPTIONS = [
  { key: 'modalPrice_desc', label: 'Modal Price ↓' },
  { key: 'modalPrice_asc', label: 'Modal Price ↑' },
  { key: 'arrivalDate_desc', label: 'Date (Newest)' },
  { key: 'arrivalDate_asc', label: 'Date (Oldest)' },
]

function parseDate(dateStr) {
  if (!dateStr || dateStr === '—') return null
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts
    return new Date(`${yyyy}-${mm}-${dd}`)
  }
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

export function MarketTable({ records }) {
  const [localFilters, setLocalFilters] = useState({
    commodity: '',
    state: '',
    district: '',
    market: '',
  })
  const [searchText, setSearchText] = useState('')
  const [sortKey, setSortKey] = useState('modalPrice_desc')
  const [page, setPage] = useState(0)

  const handleFilter = useCallback((filters) => {
    setLocalFilters(filters)
    setPage(0)
  }, [])

  const handleSearch = useCallback((text) => {
    setSearchText(text)
    setPage(0)
  }, [])

  // Filter + Search + Sort
  const processedData = useMemo(() => {
    let data = records || []

    // Apply filters
    if (localFilters.commodity.trim()) {
      data = data.filter((r) =>
        r.commodity.toLowerCase().includes(localFilters.commodity.toLowerCase()),
      )
    }
    if (localFilters.state.trim()) {
      data = data.filter((r) =>
        r.state.toLowerCase().includes(localFilters.state.toLowerCase()),
      )
    }
    if (localFilters.district.trim()) {
      data = data.filter((r) =>
        r.district.toLowerCase().includes(localFilters.district.toLowerCase()),
      )
    }
    if (localFilters.market.trim()) {
      data = data.filter((r) =>
        r.market.toLowerCase().includes(localFilters.market.toLowerCase()),
      )
    }

    // Apply search across all text fields
    if (searchText.trim()) {
      const q = searchText.toLowerCase()
      data = data.filter(
        (r) =>
          r.commodity.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q) ||
          r.market.toLowerCase().includes(q),
      )
    }

    // Apply sort
    const [field, dir] = sortKey.split('_')
    data = [...data].sort((a, b) => {
      if (field === 'modalPrice') {
        const diff = Number(a.modalPrice || 0) - Number(b.modalPrice || 0)
        return dir === 'asc' ? diff : -diff
      }
      if (field === 'arrivalDate') {
        const da = parseDate(a.arrivalDate)
        const db = parseDate(b.arrivalDate)
        if (!da && !db) return 0
        if (!da) return 1
        if (!db) return -1
        const diff = da.getTime() - db.getTime()
        return dir === 'asc' ? diff : -diff
      }
      return 0
    })

    return data
  }, [records, localFilters, searchText, sortKey])

  const totalPages = Math.max(1, Math.ceil(processedData.length / ITEMS_PER_PAGE))
  const pagedData = processedData.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE,
  )
  const isEmpty = processedData.length === 0

  return (
    <section className="mi-section" id="all-market-prices-section">
      <div className="mi-section-header">
        <span className="mi-section-icon">📋</span>
        <h2 className="mi-section-title">All Market Prices</h2>
      </div>
      <p className="mi-section-subtitle">
        Complete market dataset with search, filtering, and sorting.
      </p>

      <Filters
        fields={FILTER_FIELDS}
        onFilter={handleFilter}
        searchPlaceholder="Search commodity, market, state…"
        onSearch={handleSearch}
      />

      <div className="mi-sort-bar">
        <span className="mi-result-count">
          {processedData.length.toLocaleString()} result{processedData.length !== 1 ? 's' : ''}
        </span>
        <div className="mi-sort-controls">
          <span className="mi-sort-label">Sort by</span>
          <select
            value={sortKey}
            onChange={(e) => {
              setSortKey(e.target.value)
              setPage(0)
            }}
            className="mi-sort-select"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mi-table-card">
        {isEmpty ? (
          <div className="mi-empty-state">
            <div className="mi-empty-icon">🔍</div>
            <span className="mi-empty-title">No market data available.</span>
            <span className="mi-empty-msg">Try changing your filters.</span>
          </div>
        ) : (
          <>
            <div className="mi-table-wrap">
              <table className="mi-table">
                <thead>
                  <tr>
                    {[
                      { label: 'Commodity', align: 'left' },
                      { label: 'State', align: 'left' },
                      { label: 'District', align: 'left' },
                      { label: 'Market / APMC', align: 'left' },
                      { label: 'Min Price (₹/Qt)', align: 'right' },
                      { label: 'Max Price (₹/Qt)', align: 'right' },
                      { label: 'Modal Price (₹/Qt)', align: 'right' },
                      { label: 'Arrival Date', align: 'left' },
                    ].map((col) => (
                      <th
                        key={col.label}
                        className={col.align === 'right' ? 'mi-table-th--right' : ''}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedData.map((r, i) => (
                    <tr
                      key={`${r.commodity}-${r.market}-${r.state}-${page}-${i}`}
                    >
                      <td className="mi-table-commodity">{r.commodity}</td>
                      <td>{r.state}</td>
                      <td>{r.district}</td>
                      <td>{r.market}</td>
                      <td className="mi-table-price--min mi-table-cell--right">
                        {formatPrice(r.minPrice)}
                      </td>
                      <td className="mi-table-price--max mi-table-cell--right">
                        {formatPrice(r.maxPrice)}
                      </td>
                      <td className="mi-table-price--modal mi-table-cell--right">
                        {formatPrice(r.modalPrice)}
                      </td>
                      <td className="mi-table-date">{r.arrivalDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {processedData.length > ITEMS_PER_PAGE && (
              <div className="mi-pagination">
                <span className="mi-pagination-info">
                  Page {page + 1} of {totalPages} · Showing{' '}
                  {page * ITEMS_PER_PAGE + 1}–
                  {Math.min((page + 1) * ITEMS_PER_PAGE, processedData.length)} of{' '}
                  {processedData.length.toLocaleString()}
                </span>
                <div className="mi-pagination-controls">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                    className="mi-page-btn"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="mi-page-btn"
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
  )
}
