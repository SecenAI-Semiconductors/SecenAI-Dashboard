/**
 * useMarketData.js
 *
 * Custom React hook that powers the entire Market Intelligence page.
 * Fetches a large batch from the API once on mount (or when filters change),
 * then derives all section-specific data via memoization.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { fetchMarketData } from '../services/marketApi'

/**
 * Parse a price string into a number, returning 0 if invalid.
 */
function parsePrice(val) {
  const n = Number(val)
  return Number.isFinite(n) ? n : 0
}

/**
 * Parse an arrival date string (dd/MM/yyyy) into a Date object.
 * Returns null if the format is unrecognized.
 */
function parseDate(dateStr) {
  if (!dateStr || dateStr === '—') return null
  // API returns dates like "15/07/2026"
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts
    return new Date(`${yyyy}-${mm}-${dd}`)
  }
  // Fallback: try native parsing
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

export function useMarketData(initialCommodity = 'Wheat') {
  const [rawRecords, setRawRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Global filters — changing these triggers a new API fetch
  const [commodity, setCommodity] = useState(initialCommodity)
  const [stateFilter, setStateFilter] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMarketData({
        commodity: commodity.trim(),
        state: stateFilter.trim(),
      })
      setRawRecords(data.records)
      setTotal(data.total)
    } catch (err) {
      setError(err.message || 'Failed to fetch market data.')
      setRawRecords([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [commodity, stateFilter])

  // Fetch on mount and when global filters change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Derived: Top 3 markets by modal price ──
  const topMarkets = useMemo(() => {
    return [...rawRecords]
      .sort((a, b) => parsePrice(b.modalPrice) - parsePrice(a.modalPrice))
      .slice(0, 3)
  }, [rawRecords])

  // ── Derived: Chart data (grouped by arrival date) ──
  const chartData = useMemo(() => {
    const byDate = {}
    for (const r of rawRecords) {
      const d = parseDate(r.arrivalDate)
      if (!d) continue
      const key = d.toISOString().slice(0, 10) // yyyy-mm-dd
      if (!byDate[key]) {
        byDate[key] = {
          date: key,
          displayDate: r.arrivalDate,
          modalPrice: parsePrice(r.modalPrice),
          market: r.market,
          count: 1,
        }
      } else {
        // Average the modal price for the same date
        byDate[key].modalPrice =
          (byDate[key].modalPrice * byDate[key].count + parsePrice(r.modalPrice)) /
          (byDate[key].count + 1)
        byDate[key].count += 1
      }
    }
    return Object.values(byDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({
        ...d,
        modalPrice: Math.round(d.modalPrice),
      }))
  }, [rawRecords])

  // ── Derived: Nearby markets (first 10 filtered by state) ──
  const nearbyMarkets = useMemo(() => {
    if (!stateFilter.trim()) {
      // If no state is selected, return first 10 records
      return rawRecords.slice(0, 10)
    }
    return rawRecords
      .filter((r) => r.state.toLowerCase().includes(stateFilter.toLowerCase()))
      .slice(0, 10)
  }, [rawRecords, stateFilter])

  // ── Unique filter options derived from data ──
  const filterOptions = useMemo(() => {
    const commodities = new Set()
    const states = new Set()
    const districts = new Set()
    const markets = new Set()

    for (const r of rawRecords) {
      if (r.commodity) commodities.add(r.commodity)
      if (r.state) states.add(r.state)
      if (r.district) districts.add(r.district)
      if (r.market) markets.add(r.market)
    }

    return {
      commodities: [...commodities].sort(),
      states: [...states].sort(),
      districts: [...districts].sort(),
      markets: [...markets].sort(),
    }
  }, [rawRecords])

  return {
    // Raw data
    rawRecords,
    total,

    // Derived data
    topMarkets,
    chartData,
    nearbyMarkets,
    filterOptions,

    // State
    loading,
    error,

    // Global filter controls
    commodity,
    setCommodity,
    stateFilter,
    setStateFilter,

    // Actions
    refetch: fetchData,

    // Utilities
    parsePrice,
    parseDate,
  }
}
