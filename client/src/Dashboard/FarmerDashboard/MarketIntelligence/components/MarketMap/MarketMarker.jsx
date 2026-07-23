/**
 * MarketMarker.jsx
 *
 * Individual map marker for a market location.
 * Uses a custom SVG DivIcon to avoid Leaflet's default icon issues
 * in bundled production builds.
 *
 * Color-coded by price tier (high/medium/low).
 * Best market gets a larger gold marker with a star.
 */

import { useMemo } from 'react'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { MarketPopup } from './MarketPopup'

/**
 * Build a custom Leaflet DivIcon with an SVG map pin.
 */
function createMarkerIcon(color, size, isBest) {
  const w = isBest ? size + 10 : size
  const h = isBest ? size + 14 : size + 4

  const starSvg = isBest
    ? `<text x="${w / 2}" y="${h / 2 - 2}" text-anchor="middle" font-size="10" fill="#fff" font-weight="bold">⭐</text>`
    : ''

  const html = `
    <div class="mm-marker${isBest ? ' mm-marker--best' : ''}">
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <path d="M${w / 2} ${h}
                 C${w / 2} ${h}, ${w * 0.05} ${h * 0.55}, ${w * 0.05} ${h * 0.36}
                 C${w * 0.05} ${h * 0.12}, ${w * 0.25} 0, ${w / 2} 0
                 C${w * 0.75} 0, ${w * 0.95} ${h * 0.12}, ${w * 0.95} ${h * 0.36}
                 C${w * 0.95} ${h * 0.55}, ${w / 2} ${h}, ${w / 2} ${h}Z"
              fill="${color}" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/>
        <circle cx="${w / 2}" cy="${h * 0.34}" r="${w * 0.18}" fill="rgba(255,255,255,0.35)"/>
        ${starSvg}
      </svg>
    </div>
  `

  return L.divIcon({
    html,
    className: '', // Remove default leaflet-div-icon styles
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h + 4],
  })
}

/** Color constants for price tiers */
const COLORS = {
  high: '#2e9e50',   // Green
  medium: '#f0a500', // Yellow/amber
  low: '#e74c3c',    // Red
  best: '#ff9800',   // Gold
}

export function MarketMarker({ market, priceTier, isBest }) {
  const lat = Number(market.lat)
  const lng = Number(market.lng)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }

  const icon = useMemo(() => {
    if (isBest) return createMarkerIcon(COLORS.best, 32, true)
    const color = COLORS[priceTier] || COLORS.medium
    return createMarkerIcon(color, 24, false)
  }, [priceTier, isBest])

  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      zIndexOffset={isBest ? 1000 : 0}
    >
      <MarketPopup market={market} isBest={isBest} />
    </Marker>
  )
}
