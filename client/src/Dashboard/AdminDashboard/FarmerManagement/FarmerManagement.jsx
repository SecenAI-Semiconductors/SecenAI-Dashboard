import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { InstallButton } from '../../../pwa/InstallButton'
import farmerService from '../../../services/farmerService'
import { FarmerTable, TableSkeleton } from './FarmerTable'
import { FarmerModal } from './FarmerModal'
import { FarmerViewDrawer } from './FarmerViewDrawer'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import { useToast, ToastContainer } from './Toast'
import './FarmerManagement.css'

/**
 * Main Farmer Management page.
 * Handles all CRUD operations, search, loading states, and error handling.
 */
export function FarmerManagement() {
  const navigate = useNavigate()
  const { toasts, showToast, dismissToast } = useToast()

  // ── Data state ──
  const [farmers, setFarmers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // ── Sort state ──
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })

  // ── Modal state ──
  const [showModal, setShowModal] = useState(false)
  const [editingFarmer, setEditingFarmer] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── View drawer state ──
  const [viewFarmer, setViewFarmer] = useState(null)

  // ── Delete state ──
  const [deletingFarmer, setDeletingFarmer] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // ── Fetch farmers ──
  const fetchFarmers = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await farmerService.getAll()
      setFarmers(data)
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Unable to connect to server'
      showToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchFarmers()
  }, [fetchFarmers])

  // ── Client-side search ──
  const filteredFarmers = useMemo(() => {
    if (!searchQuery.trim()) return farmers
    const q = searchQuery.toLowerCase()
    return farmers.filter(
      (f) =>
        f.fullName?.toLowerCase().includes(q) ||
        f.email?.toLowerCase().includes(q) ||
        f.phone?.toLowerCase().includes(q) ||
        f.district?.toLowerCase().includes(q)
    )
  }, [farmers, searchQuery])

  // ── Client-side sort ──
  const sortedFarmers = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredFarmers

    return [...filteredFarmers].sort((a, b) => {
      let aVal = a[sortConfig.key]
      let bVal = b[sortConfig.key]

      // Handle numbers (totalLandArea)
      if (sortConfig.key === 'totalLandArea') {
        aVal = Number(aVal) || 0
        bVal = Number(bVal) || 0
      } else {
        // String comparison — case insensitive
        aVal = (aVal || '').toString().toLowerCase()
        bVal = (bVal || '').toString().toLowerCase()
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredFarmers, sortConfig])

  // ── Sort handler — cycles: none → asc → desc → none ──
  function handleSort(key) {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' }
      if (prev.direction === 'asc') return { key, direction: 'desc' }
      return { key: null, direction: null }
    })
  }

  // ── Stats ──
  const activeFarmers = farmers.filter((f) => f.status === 'active').length
  const totalLand = farmers.reduce((sum, f) => sum + (f.totalLandArea || 0), 0)

  // ── Add Farmer ──
  function handleAddClick() {
    setEditingFarmer(null)
    setShowModal(true)
  }

  // ── Edit Farmer ──
  function handleEditClick(farmer) {
    setEditingFarmer(farmer)
    setShowModal(true)
  }

  // ── Submit (Create or Update) ──
  async function handleSubmit(formData) {
    try {
      setIsSubmitting(true)

      if (editingFarmer?._id) {
        await farmerService.update(editingFarmer._id, formData)
        showToast('Farmer updated successfully', 'success')
      } else {
        await farmerService.create(formData)
        showToast('Farmer created successfully', 'success')
      }

      setShowModal(false)
      setEditingFarmer(null)
      await fetchFarmers()
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Something went wrong'
      showToast(message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Delete ──
  async function handleDeleteConfirm() {
    if (!deletingFarmer) return
    try {
      setIsDeleting(true)
      await farmerService.delete(deletingFarmer._id)
      showToast('Farmer deleted successfully', 'success')
      setDeletingFarmer(null)
      await fetchFarmers()
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete farmer'
      showToast(message, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="dashboard-view" id="farmer-management-page">
      {/* ── Top bar (matches existing admin layout) ── */}
      <nav className="dashboard-topbar">
        <div className="topbar-left">
          <div className="topbar-brand-icon">S</div>
          <span className="topbar-title">Farmer Management</span>
        </div>
        <div className="topbar-right">
          <InstallButton />
          <button
            type="button"
            className="topbar-back-btn"
            onClick={() => navigate('/admin')}
            id="fm-back-button"
          >
            ← Back
          </button>
        </div>
      </nav>

      {/* ── Page content ── */}
      <section className="dashboard-content" style={{ maxWidth: 1200 }}>
        {/* Header */}
        <div className="fm-header">
          <div className="fm-header-left">
            <h1>Farmer & Field Management</h1>
            <p>Manage farmer profiles, field records, and onboarding workflows.</p>
          </div>
          <button
            className="fm-add-btn"
            onClick={handleAddClick}
            id="add-farmer-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Add Farmer
          </button>
        </div>

        {/* Stats */}
        {!isLoading && farmers.length > 0 && (
          <div className="fm-stats">
            <div className="fm-stat-card">
              <div className="fm-stat-label">Total Farmers</div>
              <div className="fm-stat-value">{farmers.length}</div>
            </div>
            <div className="fm-stat-card">
              <div className="fm-stat-label">Active</div>
              <div className="fm-stat-value">{activeFarmers}</div>
            </div>
            <div className="fm-stat-card">
              <div className="fm-stat-label">Total Land (acres)</div>
              <div className="fm-stat-value">{totalLand.toFixed(1)}</div>
            </div>
          </div>
        )}

        {/* Search */}
        {!isLoading && farmers.length > 0 && (
          <div className="fm-search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              className="fm-search-input"
              placeholder="Search by name, email, phone, or district…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="farmer-search-input"
            />
          </div>
        )}

        {/* Table / Loading / Empty */}
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : farmers.length === 0 ? (
          <EmptyState onAdd={handleAddClick} />
        ) : filteredFarmers.length === 0 ? (
          <div className="fm-empty">
            <h3>No results found</h3>
            <p>Try adjusting your search query.</p>
          </div>
        ) : (
          <FarmerTable
            farmers={sortedFarmers}
            onView={setViewFarmer}
            onEdit={handleEditClick}
            onDelete={setDeletingFarmer}
            isDeleting={isDeleting}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        )}
      </section>

      {/* ── Modals & Drawers ── */}

      {showModal && (
        <FarmerModal
          farmer={editingFarmer}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false)
            setEditingFarmer(null)
          }}
        />
      )}

      {viewFarmer && (
        <FarmerViewDrawer
          farmer={viewFarmer}
          onClose={() => setViewFarmer(null)}
        />
      )}

      {deletingFarmer && (
        <DeleteConfirmDialog
          farmer={deletingFarmer}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingFarmer(null)}
        />
      )}

      {/* ── Toast notifications ── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

/* ===== Empty State ===== */

function EmptyState({ onAdd }) {
  return (
    <div className="fm-empty" id="farmer-empty-state">
      <div className="fm-empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <h3>No farmers have been added yet</h3>
      <p>Get started by adding your first farmer to the platform.</p>
      <button className="fm-add-btn" onClick={onAdd} id="empty-add-farmer-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        Add Farmer
      </button>
    </div>
  )
}
