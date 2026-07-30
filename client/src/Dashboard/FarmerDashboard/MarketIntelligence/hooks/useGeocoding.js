/**
 * useGeocoding.js
 *
 * Custom React hook that manages geocoding of market records.
 * - Deduplicates locations by market-district-state
 * - Checks localStorage cache first (instant for repeat visits)
 * - Rate-limited batch geocoding via geocodeService
 * - Provides progress tracking for the loading UI
 * - Aborts in-flight geocoding on unmount or data change
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import {
  batchGeocode,
  cacheKey,
  getStateCenterCoords,
} from '../services/geocodeService'

/**
 * @param {Array} records - Raw market records from the API
 * @returns {{
 *   geocodedMarkets: Array<{ ...record, lat: number, lng: number }>,
 *   isGeocoding: boolean,
 *   progress: number,
 *   total: number
 * }}
 */
export function useGeocoding(records) {
  const [geocodedMarkets, setGeocodedMarkets] = useState([])
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const abortRef = useRef(null)

  // Deduplicate locations
  const uniqueLocations = useMemo(() => {
    if (!records || records.length === 0) return []

    const seen = new Set()
    const unique = []

    for (const r of records) {
      const key = `${r.market}-${r.district}-${r.state}`.toLowerCase().replace(/\s+/g, '_')
      if (!seen.has(key)) {
        seen.add(key)
        unique.push({
          market: r.market,
          district: r.district,
          state: r.state,
        })
      }
    }

    return unique
  }, [records])

  useEffect(() => {
    if (!records || records.length === 0 || uniqueLocations.length === 0) {
      setGeocodedMarkets([])
      setIsGeocoding(false)
      setProgress(0)
      setTotal(0)
      return
    }

    // Abort any previous geocoding run
    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    setIsGeocoding(true)
    setTotal(uniqueLocations.length)
    setProgress(0)

    async function run() {
      try {
        const coordsMap = await batchGeocode(
          uniqueLocations,
          (completed, total) => {
            if (!controller.signal.aborted) {
              setProgress(completed)

              // Incrementally update geocoded markets as results come in
              // Build the current state with what we have so far
              if (completed % 3 === 0 || completed === total) {
                updateGeocodedMarkets(records, coordsMap)
              }
            }
          },
          controller.signal,
        )

        if (!controller.signal.aborted) {
          updateGeocodedMarkets(records, coordsMap)
          setIsGeocoding(false)
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[useGeocoding] Batch geocoding failed:', err)
        }
        if (!controller.signal.aborted) {
          setIsGeocoding(false)
        }
      }
    }

    function updateGeocodedMarkets(records, coordsMap) {
      const result = []
      for (const r of records) {
        const key = cacheKey(r.market, r.district, r.state)
        const coords = coordsMap.get(key)
        if (coords) {
          result.push({
            ...r,
            lat: coords.lat,
            lng: coords.lng,
          })
        }
      }
      setGeocodedMarkets(result)
    }

    run()

    return () => {
      controller.abort()
    }
  }, [records, uniqueLocations])

  return {
    geocodedMarkets,
    isGeocoding,
    progress,
    total,
  }
}
