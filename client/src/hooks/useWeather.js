import { useCallback, useEffect, useMemo, useState } from 'react'
import { searchWeather } from '../api/weatherApi'

const LAST_LOCATION_KEY = 'secenai_weather_location'

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
  const [searchTerm, setSearchTerm] = useState(getStoredLocation())
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = useCallback(
    async (location) => {
      if (!location || location.trim().length === 0) {
        setError('Please enter a location.')
        return
      }

      setLoading(true)
      setError('')

      try {
        const data = await searchWeather(location.trim())
        setWeatherData(data)
        setSearchTerm(location.trim())
        setStoredLocation(location.trim())
      } catch (err) {
        setWeatherData(null)
        setError(err.message || 'Unable to load weather data.')
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError],
  )

  useEffect(() => {
    const initialLocation = getStoredLocation()
    if (initialLocation) {
      search(initialLocation)
    }
  }, [search])

  const hasData = useMemo(() => Boolean(weatherData && !loading && !error), [weatherData, loading, error])

  return {
    searchTerm,
    setSearchTerm,
    weatherData,
    loading,
    error,
    search,
    hasData,
  }
}
