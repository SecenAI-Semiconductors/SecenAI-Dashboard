/**
 * MarketMap.jsx
 *
 * Main orchestrator component for the interactive India map.
 * Replaces the previous NearbyMarkets table section.
 *
 * Responsibilities:
 *   - Receives raw market records from the parent page
 *   - Geocodes them via useGeocoding hook
 *   - Applies local filters (commodity, state, district, market)
 *   - Computes price tiers (high/medium/low) dynamically
 *   - Renders the Leaflet map with markers, popups, legend, stats
 *   - Handles search → zoom-to-marker
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { useGeocoding } from '../../hooks/useGeocoding'
import { MarketMarker } from './MarketMarker'
import { MapLegend } from './MapLegend'
import { MapFilters } from './MapFilters'
import { MarketStats } from './MarketStats'
import { LoadingMap } from './LoadingMap'
import './MarketMap.css'

function FitBounds({ markets }) {
  const map = useMap()

  useEffect(() => {
    const positions = markets
      .filter(
        (market) =>
          Number.isFinite(Number(market.lat)) &&
          Number.isFinite(Number(market.lng)),
      )
      .map((market) => [Number(market.lat), Number(market.lng)])

    if (positions.length === 0) return

    if (positions.length === 1) {
      map.setView(positions[0], 6)
      return
    }

    const bounds = L.latLngBounds(positions)
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 })
  }, [map, markets])

  return null
}

/** India center coordinates and default zoom */
const INDIA_CENTER = [22.5, 82.0]
const INDIA_ZOOM = 5

/**
 * Internal helper component to imperatively control the map
 * (e.g., fly to a searched market).
 */
function FlyToMarket({ target }) {
  const map = useMap()
  if (target) {
    map.flyTo([target.lat, target.lng], 12, { duration: 1.2 })
  }
  return null
}

export function MarketMap({ records }) {
  const mapRef = useRef(null)
  const [filters, setFilters] = useState({
    commodity: '',
    state: '',
    district: '',
    market: '',
  })
  const [flyTarget, setFlyTarget] = useState(null)

  // Geocode all records
  const { geocodedMarkets, isGeocoding, progress, total } =
    useGeocoding(records)

  // Apply filters to geocoded markets
  const filteredMarkets = useMemo(() => {
    let data = geocodedMarkets

    if (filters.commodity) {
      data = data.filter(
        (m) => m.commodity.toLowerCase() === filters.commodity.toLowerCase(),
      )
    }
    if (filters.state) {
      data = data.filter(
        (m) => m.state.toLowerCase() === filters.state.toLowerCase(),
      )
    }
    if (filters.district) {
      data = data.filter(
        (m) => m.district.toLowerCase() === filters.district.toLowerCase(),
      )
    }
    if (filters.market) {
      data = data.filter(
        (m) => m.market.toLowerCase() === filters.market.toLowerCase(),
      )
    }

    return data
  }, [geocodedMarkets, filters])

  // Find the best market (highest modal price)
  const bestMarketKey = useMemo(() => {
    if (filteredMarkets.length === 0) return null
    let best = filteredMarkets[0]
    for (const m of filteredMarkets) {
      if (Number(m.modalPrice) > Number(best.modalPrice)) {
        best = m
      }
    }
    return `${best.market}-${best.district}-${best.state}`
  }, [filteredMarkets])

  // Dynamically calculate price tiers from the current dataset
  const priceTiers = useMemo(() => {
    if (filteredMarkets.length === 0) return { lowMax: 0, highMin: 0 }

    const prices = filteredMarkets
      .map((m) => Number(m.modalPrice))
      .filter((p) => Number.isFinite(p) && p > 0)
      .sort((a, b) => a - b)

    if (prices.length === 0) return { lowMax: 0, highMin: 0 }

    const oneThird = Math.floor(prices.length / 3)
    return {
      lowMax: prices[oneThird] || prices[0],
      highMin: prices[prices.length - 1 - oneThird] || prices[prices.length - 1],
    }
  }, [filteredMarkets])

  /** Determine the price tier for a given modal price */
  const getPriceTier = useCallback(
    (modalPrice) => {
      const price = Number(modalPrice)
      if (!Number.isFinite(price) || price === 0) return 'medium'
      if (price <= priceTiers.lowMax) return 'low'
      if (price >= priceTiers.highMin) return 'high'
      return 'medium'
    },
    [priceTiers],
  )

  /** Handle search selection — zoom to the market */
  const handleSearchSelect = useCallback((market) => {
    setFlyTarget({ lat: market.lat, lng: market.lng })
    // Reset fly target after animation
    setTimeout(() => setFlyTarget(null), 2000)
  }, [])

  const hasMarkers = filteredMarkets.length > 0
  const showLoading = isGeocoding && geocodedMarkets.length === 0

  return (
    <section className="mi-section market-map-section" id="market-map-section">
      <div className="mi-section-header">
        <span className="mi-section-icon">🗺️</span>
        <h2 className="mi-section-title">Market Map</h2>
      </div>
      <p className="mi-section-subtitle">
        Interactive map showing all AGMARKNET markets across India.
        Click a marker to view market details.
        {isGeocoding && geocodedMarkets.length > 0 && (
          <span style={{ marginLeft: 8, color: 'var(--accent-farmer)' }}>
            ⏳ Locating markets… ({progress}/{total})
          </span>
        )}
      </p>

      {/* Stats */}
      <MarketStats markets={filteredMarkets} />

      {/* Filters + Search */}
      <MapFilters
        records={records}
        filters={filters}
        onFilterChange={setFilters}
        onSearchSelect={handleSearchSelect}
        geocodedMarkets={geocodedMarkets}
      />

      {/* Map Container */}
      <div className="market-map-container">
        {showLoading ? (
          <LoadingMap progress={progress} total={total} />
        ) : (
          <div className="market-map-wrapper">
            <MapContainer
              center={INDIA_CENTER}
              zoom={INDIA_ZOOM}
              scrollWheelZoom={true}
              ref={mapRef}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Keep the view centered around present markers */}
              <FitBounds markets={filteredMarkets} />
              <FlyToMarket target={flyTarget} />

              {/* Market markers */}
              {filteredMarkets.map((market, idx) => {
                const key = `${market.market}-${market.district}-${market.state}`
                const isBest = key === bestMarketKey
                return (
                  <MarketMarker
                    key={`${key}-${idx}`}
                    market={market}
                    priceTier={getPriceTier(market.modalPrice)}
                    isBest={isBest}
                  />
                )
              })}
            </MapContainer>

            {/* Floating Legend */}
            <MapLegend />
          </div>
        )}

        {/* Empty state — after geocoding but no results */}
        {!showLoading && !isGeocoding && !hasMarkers && (
          <div className="mi-empty-state" style={{ padding: '48px 24px' }}>
            <div className="mi-empty-icon">🔍</div>
            <span className="mi-empty-title">
              No markets found on the map.
            </span>
            <span className="mi-empty-msg">
              Try adjusting your filters or search for a different market.
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
