import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getWeatherDataForCoordinates, searchWeather } from '../api/weatherApi'
import api from '../services/api'

const LAST_LOCATION_KEY = 'secenai_weather_location'
const DEFAULT_LOCATION = 'Hyderabad'

function getStoredLocation() {
  try {
    return localStorage.getItem(LAST_LOCATION_KEY) || ''
  } catch (error) {
    return ''
  }
}

function setStoredLocation(location) {
  try {
    localStorage.setItem(LAST_LOCATION_KEY, location)
  } catch (error) {
    // ignore local storage failures
  }
}

export function useWeather() {
  const [searchTerm, setSearchTerm] = useState(getStoredLocation() || DEFAULT_LOCATION)
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // AI intelligence state — separate from weather data loading
  const [aiData, setAiData] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  // Track the latest AI request to avoid stale responses
  const aiRequestIdRef = useRef(0)

  /**
   * Fetch AI intelligence from the backend.
   * Runs in the background after OpenWeather data is ready.
   * Does not block the main weather display.
   */
  const fetchAiIntelligence = useCallback(async (data) => {
    const requestId = ++aiRequestIdRef.current
    setAiLoading(true)
    setAiError('')

    try {
      const response = await api.post('/api/weather/intelligence', {
        current: data.current,
        summary: data.summary,
        hourly: data.hourly,
        daily: data.daily,
        locationName: data.locationName,
        coords: data.coords,
      })

      // Only apply if this is still the latest request
      if (requestId !== aiRequestIdRef.current) return

      const result = response.data

      if (result.aiUnavailable) {
        setAiData(null)
        setAiError('AI analysis is temporarily unavailable. Current weather data is still available.')
      } else {
        setAiData(result)
        setAiError('')
      }
    } catch (err) {
      if (requestId !== aiRequestIdRef.current) return
      setAiData(null)
      setAiError('AI analysis is temporarily unavailable. Current weather data is still available.')
    } finally {
      if (requestId === aiRequestIdRef.current) {
        setAiLoading(false)
      }
    }
  }, [])

  const search = useCallback(
    async (location) => {
      if (!location || location.trim().length === 0) {
        setError('Please enter a location.')
        return
      }

      setLoading(true)
      setError('')
      // Reset AI state on new search
      setAiData(null)
      setAiError('')

      try {
        const data = await searchWeather(location.trim())
        setWeatherData(data)
        setSearchTerm(location.trim())
        setStoredLocation(location.trim())

        // Fire AI fetch in background (non-blocking)
        fetchAiIntelligence(data)
      } catch (err) {
        setWeatherData(null)
        setError(err.message || 'Unable to load weather data.')
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, fetchAiIntelligence],
  )

  const loadCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      console.warn('[Weather] Geolocation unavailable, using default location')
      await search(DEFAULT_LOCATION)
      return
    }

    console.log('[Weather] Loading weather page from browser location')
    setLoading(true)
    setError('')
    setAiData(null)
    setAiError('')

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000,
        })
      })

      const { latitude, longitude } = position.coords
      console.log('[Weather] Geolocation resolved, fetching weather and Gemini analysis')
      const data = await getWeatherDataForCoordinates(latitude, longitude, 'Current location')

      setWeatherData(data)
      setSearchTerm('Current location')

      fetchAiIntelligence(data)
    } catch (err) {
      console.warn('[Weather] Geolocation failed, falling back to default location', err?.message || err)
      setWeatherData(null)
      await search(DEFAULT_LOCATION)
    } finally {
      setLoading(false)
    }
  }, [fetchAiIntelligence, search])

  useEffect(() => {
    console.log('[Weather] useWeather mounted')
    const initialLocation = getStoredLocation()
    if (initialLocation) {
      console.log('[Weather] Reusing stored location:', initialLocation)
      search(initialLocation)
      return
    }

    console.log('[Weather] No stored location, attempting geolocation')
    loadCurrentLocation()
  }, [loadCurrentLocation, search])

  const hasData = useMemo(() => Boolean(weatherData && !loading && !error), [weatherData, loading, error])

  return {
    searchTerm,
    setSearchTerm,
    weatherData,
    loading,
    error,
    search,
    hasData,
    // AI intelligence
    aiData,
    aiLoading,
    aiError,
  }
}
