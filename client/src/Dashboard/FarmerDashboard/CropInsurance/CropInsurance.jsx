/**
 * CropInsurance.jsx
 *
 * Page orchestrator for the Crop Insurance dashboard.
 * Fetches data once via useInsurance hook, then distributes
 * derived data to each section component.
 *
 * Sections (in order):
 *   1. Insurance Overview (stats cards)
 *   2. Apply for Insurance (form + premium estimate)
 *   3. My Insurance Requests (submitted applications)
 */

import { useState, useEffect, useCallback } from 'react'
import { useInsurance } from './hooks/useInsurance'
import { InsuranceOverview } from './components/InsuranceOverview'
import { InsuranceForm } from './components/InsuranceForm'
import { InsuranceRequestList } from './components/InsuranceRequestList'
import { InsuranceDetailDrawer } from './components/InsuranceDetailDrawer'
import {
  SkeletonOverview,
  SkeletonForm,
  SkeletonRequests,
} from './components/LoadingSkeleton'
import { submitInsurance } from './services/insuranceApi'
import { useToast, ToastContainer } from '../../AdminDashboard/FarmerManagement/Toast'
import farmerService from '../../../services/farmerService'
import './CropInsurance.css'

export function CropInsurance() {
  const { requests, stats, loading, error, refetch } = useInsurance()
  const { toasts, showToast, dismissToast } = useToast()

  // ── Farmers list for the form dropdown ──
  const [farmers, setFarmers] = useState([])
  const [farmersLoading, setFarmersLoading] = useState(true)

  // ── Detail drawer state ──
  const [viewRequest, setViewRequest] = useState(null)

  // ── Submission state ──
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Fetch farmers for form dropdown ──
  const fetchFarmers = useCallback(async () => {
    try {
      setFarmersLoading(true)
      const data = await farmerService.getAll()
      setFarmers(data)
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to load farmers'
      showToast(message, 'error')
    } finally {
      setFarmersLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchFarmers()
  }, [fetchFarmers])

  // ── Submit insurance application ──
  async function handleSubmit(formData) {
    try {
      setIsSubmitting(true)
      await submitInsurance(formData)
      showToast('Insurance application submitted successfully!', 'success')
      await refetch()
      return true
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to submit insurance application'
      showToast(message, 'error')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const isPageLoading = loading || farmersLoading

  return (
    <div className="ci-page" id="crop-insurance-page">
      <section className="ci-content">
        {/* ──── Page Header ──── */}
        <div className="ci-page-header">
          <div className="ci-page-title-row">
            <span className="ci-page-chip">🛡️ Crop Protection</span>
          </div>
          <h1 className="ci-page-title">Crop Insurance</h1>
          <p className="ci-page-subtitle">
            Protect your crops with comprehensive insurance coverage. Apply for
            insurance, track your applications, and manage your coverage — all
            in one place.
          </p>
        </div>

        {/* ──── Error State ──── */}
        {error && !loading && (
          <div className="ci-error-card">
            <div className="ci-error-icon">⚠️</div>
            <div className="ci-error-title">Unable to load insurance data.</div>
            <div className="ci-error-msg">{error}</div>
            <button
              type="button"
              onClick={refetch}
              className="ci-retry-btn"
              id="insurance-retry-btn"
            >
              Retry
            </button>
          </div>
        )}

        {/* ──── Loading State ──── */}
        {isPageLoading && (
          <>
            <SkeletonOverview />
            <SkeletonForm />
            <SkeletonRequests />
          </>
        )}

        {/* ──── Content Sections ──── */}
        {!isPageLoading && !error && (
          <>
            {/* Section 1: Insurance Overview */}
            <InsuranceOverview stats={stats} />

            {/* Section 2: Apply for Insurance */}
            <InsuranceForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              farmers={farmers}
            />

            {/* Section 3: My Insurance Requests */}
            <InsuranceRequestList
              requests={requests}
              onViewDetails={setViewRequest}
            />
          </>
        )}
      </section>

      {/* ── Detail Drawer ── */}
      {viewRequest && (
        <InsuranceDetailDrawer
          request={viewRequest}
          onClose={() => setViewRequest(null)}
        />
      )}

      {/* ── Toast notifications ── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
