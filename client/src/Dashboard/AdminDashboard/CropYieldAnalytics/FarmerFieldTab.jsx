/**
 * FarmerFieldTab.jsx — Farmer & Field tab
 *
 * Sortable, paginated table with search. Row click opens a drawer showing
 * that farmer's plots across all seasons (same pattern as CaseDetailDrawer).
 */

import { useState, useMemo } from 'react'
import { applyFilters } from './api'
import { formatNumber, formatPercent, formatYield, CHART_COLORS } from './utils'
import { StatusBadge, SortIcon, Pagination, EmptyState } from './CropYieldAnalytics'

const PAGE_SIZE = 15

export function FarmerFieldTab({ data, allData }) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('farmerName')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [drawerFarmerId, setDrawerFarmerId] = useState(null)

  // ── Search + sort ──
  const filtered = useMemo(() => {
    let result = data
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        r.farmerName.toLowerCase().includes(q) ||
        r.plotName.toLowerCase().includes(q) ||
        r.crop.toLowerCase().includes(q)
      )
    }
    return [...result].sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey]
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      return sortDir === 'asc'
        ? (typeof va === 'string' ? va.localeCompare(vb) : va - vb)
        : (typeof va === 'string' ? vb.localeCompare(va) : vb - va)
    })
  }, [data, search, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset page on search/sort change
  useMemo(() => setPage(1), [search, sortKey, sortDir])

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const TH = ({ label, field }) => (
    <th className="cya-th-sortable" onClick={() => handleSort(field)}>
      <span className="cya-th-sort-content">{label} <SortIcon active={sortKey === field} dir={sortDir} /></span>
    </th>
  )

  // ── Drawer data ──
  const drawerRecords = useMemo(() => {
    if (!drawerFarmerId) return []
    return allData.filter(r => r.farmerId === drawerFarmerId)
      .sort((a, b) => a.season.localeCompare(b.season) || a.plotName.localeCompare(b.plotName))
  }, [drawerFarmerId, allData])

  const drawerFarmerName = drawerRecords[0]?.farmerName || ''

  if (data.length === 0) return <EmptyState />

  return (
    <>
      {/* ── Search ── */}
      <div className="cya-filters" style={{ marginBottom: 16 }}>
        <div className="cya-search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="cya-search-input" placeholder="Search farmer, plot, or crop…"
            value={search} onChange={e => setSearch(e.target.value)} id="cya-farmer-search" />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="cya-card">
        <h3 className="cya-section-title">Farmer &amp; Field Records</h3>
        <p className="cya-section-subtitle">{filtered.length} records{search ? ` matching "${search}"` : ''}</p>
        <div className="cya-table-container">
          <table className="cya-table" id="cya-farmer-table">
            <thead>
              <tr>
                <TH label="Farmer" field="farmerName" />
                <TH label="Plot" field="plotName" />
                <TH label="District" field="district" />
                <TH label="Crop" field="crop" />
                <TH label="Area (ac)" field="area" />
                <TH label="Expected" field="expectedYield" />
                <TH label="Actual" field="actualYield" />
                <TH label="Yield/Acre" field="yieldPerAcre" />
                <TH label="Variance" field="variancePct" />
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(r => (
                <tr key={r._id} className="cya-row-clickable" onClick={() => setDrawerFarmerId(r.farmerId)}>
                  <td style={{ fontWeight: 500 }}>{r.farmerName}</td>
                  <td>{r.plotName}</td>
                  <td>{r.district}</td>
                  <td>{r.crop}</td>
                  <td>{formatNumber(r.area, 1)}</td>
                  <td>{r.expectedYield.toFixed(2)}</td>
                  <td>{r.actualYield != null ? r.actualYield.toFixed(2) : '—'}</td>
                  <td>{r.yieldPerAcre != null ? r.yieldPerAcre.toFixed(2) : '—'}</td>
                  <td>{r.variancePct != null ? formatPercent(r.variancePct) : '—'}</td>
                  <td><StatusBadge status={r.status} isProjected={r.isProjected} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* ── Drawer ── */}
      {drawerFarmerId && (
        <div className="cya-drawer-overlay" onClick={() => setDrawerFarmerId(null)}>
          <div className="cya-drawer" onClick={e => e.stopPropagation()}>
            <div className="cya-drawer-header">
              <div>
                <h2>{drawerFarmerName}</h2>
                <span className="cya-drawer-sub">{drawerRecords.length} plot records across all seasons</span>
              </div>
              <button className="cya-drawer-close" onClick={() => setDrawerFarmerId(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="cya-drawer-body">
              {drawerRecords.map(r => (
                <div key={r._id} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{r.plotName}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{r.season}</span>
                    </div>
                    <StatusBadge status={r.status} isProjected={r.isProjected} />
                  </div>
                  <div className="cya-detail-grid">
                    <div className="cya-detail-field">
                      <span className="cya-detail-label">Crop</span>
                      <span className="cya-detail-value">{r.crop}</span>
                    </div>
                    <div className="cya-detail-field">
                      <span className="cya-detail-label">Area</span>
                      <span className="cya-detail-value">{r.area} acres</span>
                    </div>
                    <div className="cya-detail-field">
                      <span className="cya-detail-label">Expected Yield</span>
                      <span className="cya-detail-value">{r.expectedYield.toFixed(2)} t/ac</span>
                    </div>
                    <div className="cya-detail-field">
                      <span className="cya-detail-label">{r.isProjected ? 'Forecast Yield' : 'Actual Yield'}</span>
                      <span className="cya-detail-value">{r.yieldPerAcre != null ? r.yieldPerAcre.toFixed(2) : '—'} t/ac</span>
                    </div>
                    <div className="cya-detail-field">
                      <span className="cya-detail-label">Production</span>
                      <span className="cya-detail-value">{formatNumber(r.production, 1)} t</span>
                    </div>
                    <div className="cya-detail-field">
                      <span className="cya-detail-label">Variance</span>
                      <span className="cya-detail-value">{r.variancePct != null ? formatPercent(r.variancePct) : '—'}</span>
                    </div>
                    <div className="cya-detail-field">
                      <span className="cya-detail-label">Stage</span>
                      <span className="cya-detail-value" style={{ textTransform: 'capitalize' }}>{r.stage}</span>
                    </div>
                    <div className="cya-detail-field">
                      <span className="cya-detail-label">Sowing Date</span>
                      <span className="cya-detail-value">{r.sowingDate}</span>
                    </div>
                    <div className="cya-detail-field">
                      <span className="cya-detail-label">Harvest Date</span>
                      <span className="cya-detail-value">{r.actualHarvestDate || r.harvestDate}</span>
                    </div>
                    {r.regionalBenchmark != null && (
                      <div className="cya-detail-field">
                        <span className="cya-detail-label">District Benchmark</span>
                        <span className="cya-detail-value">{r.regionalBenchmark.toFixed(2)} t/ac</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
