import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchLatestSoil, fetchSoilHistory } from '../services/soilApi'
import farmerService from '../../../../services/farmerService'
import { calculateHealthScore, generateAlerts, generateFertilizerRecs, generateAIRecommendation } from '../utils/soilThresholds'

export function useSoilData() {
  const [farmers, setFarmers] = useState([])
  const [selectedFarmerId, setSelectedFarmerId] = useState('')
  const [farmersLoading, setFarmersLoading] = useState(true)

  const [currentSoil, setCurrentSoil] = useState(null)
  const [history, setHistory] = useState([])
  const [soilLoading, setSoilLoading] = useState(false)
  const [error, setError] = useState(null)

  // 1. Fetch available farmers (for the Field Selector)
  const loadFarmers = useCallback(async () => {
    try {
      setFarmersLoading(true)
      const data = await farmerService.getAll()
      setFarmers(data)
      if (data.length > 0) {
        setSelectedFarmerId(data[0]._id)
      }
    } catch (err) {
      setError('Failed to load farmer profiles')
    } finally {
      setFarmersLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFarmers()
  }, [loadFarmers])

  // 2. Fetch soil data when selected farmer changes
  const loadSoilData = useCallback(async (farmerId) => {
    if (!farmerId) return

    setSoilLoading(true)
    setError(null)
    try {
      // Run both queries concurrently
      const [latest, hist] = await Promise.all([
        fetchLatestSoil(farmerId).catch(() => null), // 404 is fine (empty state)
        fetchSoilHistory(farmerId).catch(() => [])
      ])
      setCurrentSoil(latest)
      setHistory(hist)
    } catch (err) {
      setError('Failed to load soil intelligence data')
      setCurrentSoil(null)
      setHistory([])
    } finally {
      setSoilLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedFarmerId) {
      loadSoilData(selectedFarmerId)
    }
  }, [selectedFarmerId, loadSoilData])

  // 3. Derived state via memoization
  const selectedFarmer = useMemo(() => {
    return farmers.find(f => f._id === selectedFarmerId) || null
  }, [farmers, selectedFarmerId])

  // Mock data fallback
  const fallbackSoil = useMemo(() => ({
    farmerId: selectedFarmerId,
    ph: 6.8,
    moisture: 42,
    nitrogen: 380,
    phosphorus: 22,
    potassium: 160,
    organicCarbon: 1.4,
    electricalConductivity: 1.2,
    soilType: 'Loamy',
    recordedAt: new Date().toISOString()
  }), [selectedFarmerId])

  const fallbackHistory = useMemo(() => {
    const dates = [
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      new Date().toISOString()
    ]
    return [
      { ph: 6.2, moisture: 35, nitrogen: 320, phosphorus: 18, potassium: 120, organicCarbon: 1.1, electricalConductivity: 1.0, recordedAt: dates[0] },
      { ph: 6.5, moisture: 55, nitrogen: 350, phosphorus: 20, potassium: 140, organicCarbon: 1.2, electricalConductivity: 1.1, recordedAt: dates[1] },
      fallbackSoil
    ]
  }, [fallbackSoil])

  const activeSoil = currentSoil || fallbackSoil
  const activeHistory = history.length > 0 ? history : fallbackHistory

  const health = useMemo(() => calculateHealthScore(activeSoil), [activeSoil])
  const alerts = useMemo(() => generateAlerts(activeSoil), [activeSoil])
  const fertilizerRecs = useMemo(() => generateFertilizerRecs(activeSoil), [activeSoil])
  const aiRec = useMemo(() => generateAIRecommendation(activeSoil, health), [activeSoil, health])

  return {
    // Dropdown state
    farmers,
    selectedFarmer,
    selectedFarmerId,
    setSelectedFarmerId,
    farmersLoading,

    // Data state
    currentSoil: activeSoil,
    history: activeHistory,
    soilLoading,
    error,
    
    // Derived state
    health,
    alerts,
    fertilizerRecs,
    aiRec,

    // Actions
    refetch: () => selectedFarmerId && loadSoilData(selectedFarmerId),
  }
}
