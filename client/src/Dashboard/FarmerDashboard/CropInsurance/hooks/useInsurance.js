/**
 * useInsurance.js
 *
 * Custom React hook that powers the entire Crop Insurance page.
 * Fetches all insurance requests on mount, then derives
 * overview statistics via memoization.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { fetchInsuranceRequests } from '../services/insuranceApi'

export function useInsurance() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchInsuranceRequests()
      setRequests(data)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch insurance requests.'
      )
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Derived: Overview statistics ──
  const stats = useMemo(() => {
    const total = requests.length
    const pending = requests.filter((r) => r.status === 'Pending').length
    const approved = requests.filter((r) => r.status === 'Approved').length
    const rejected = requests.filter((r) => r.status === 'Rejected').length
    const totalCoverage = requests.reduce(
      (sum, r) => sum + (r.requestedCoverage || 0),
      0
    )
    const totalPremium = requests.reduce(
      (sum, r) => sum + (r.estimatedInsurancePremium || 0),
      0
    )

    return { total, pending, approved, rejected, totalCoverage, totalPremium }
  }, [requests])

  return {
    // Raw data
    requests,

    // Derived data
    stats,

    // State
    loading,
    error,

    // Actions
    refetch: fetchData,
  }
}
