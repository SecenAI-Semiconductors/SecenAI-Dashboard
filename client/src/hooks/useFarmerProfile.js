/**
 * useFarmerProfile.js
 *
 * Hook exposing the authenticated farmer's own profile, crops, and land area.
 * Calls GET /api/farmer/me/profile (JWT required — attached by api.js interceptor).
 *
 * Usage:
 *   const { profile, crops, totalLandArea, loading, error, refetch } = useFarmerProfile()
 *
 * Returns null values until the request resolves.
 * Individual farmer modules can import this hook when they need profile data.
 */

import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useFarmerProfile() {
  const [profile,       setProfile]       = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/farmer/me/profile')
      setProfile(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    crops:         profile?.crops         ?? [],
    totalLandArea: profile?.totalLandArea ?? 0,
    loading,
    error,
    refetch: fetchProfile,
  }
}

