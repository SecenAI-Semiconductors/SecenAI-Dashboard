/**
 * geocodeService.js
 *
 * Geocodes market addresses using the OpenStreetMap Nominatim API.
 * - Caches results in localStorage to avoid repeated requests.
 * - Implements a 1-second delay between requests to respect rate limits.
 * - Falls back from full address to district+state if the first attempt fails.
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const CACHE_PREFIX = 'geocache-'

const STATE_CENTER_COORDS = {
  'andaman and nicobar islands': { lat: 11.7401, lng: 92.6586 },
  'andhra pradesh': { lat: 14.7504, lng: 78.5708 },
  'arunachal pradesh': { lat: 28.2180, lng: 94.7278 },
  assam: { lat: 26.2006, lng: 92.9376 },
  bihar: { lat: 25.0961, lng: 85.3131 },
  chhattisgarh: { lat: 21.2951, lng: 81.8282 },
  goa: { lat: 15.2993, lng: 74.1240 },
  gujarat: { lat: 22.2587, lng: 71.1924 },
  haryana: { lat: 29.0588, lng: 76.0856 },
  'himachal pradesh': { lat: 31.1048, lng: 77.1734 },
  jharkhand: { lat: 23.6102, lng: 85.2799 },
  karnataka: { lat: 15.3173, lng: 75.7139 },
  kerala: { lat: 10.8505, lng: 76.2711 },
  'madhya pradesh': { lat: 22.9734, lng: 78.6569 },
  maharashtra: { lat: 19.7515, lng: 75.7139 },
  manipur: { lat: 24.6637, lng: 93.9063 },
  meghalaya: { lat: 25.4670, lng: 91.3662 },
  mizoram: { lat: 23.1645, lng: 92.9376 },
  nagaland: { lat: 26.1584, lng: 94.5624 },
  odisha: { lat: 20.9517, lng: 85.0985 },
  punjab: { lat: 31.1471, lng: 75.3412 },
  rajasthan: { lat: 27.0238, lng: 74.2179 },
  sikkim: { lat: 27.5330, lng: 88.5122 },
  'tamil nadu': { lat: 11.1271, lng: 78.6569 },
  telangana: { lat: 18.1124, lng: 79.0193 },
  tripura: { lat: 23.9408, lng: 91.9882 },
  'uttar pradesh': { lat: 26.8467, lng: 80.9462 },
  uttarakhand: { lat: 30.0668, lng: 79.0193 },
  'west bengal': { lat: 22.9868, lng: 87.8550 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  delhi: { lat: 28.7041, lng: 77.1025 },
  'jammu and kashmir': { lat: 33.7782, lng: 76.5762 },
  ladakh: { lat: 34.2268, lng: 77.5619 },
  lakshadweep: { lat: 10.5626, lng: 72.6369 },
  puducherry: { lat: 11.9416, lng: 79.8083 },
  'dadra and nagar haveli and daman and diu': { lat: 20.1809, lng: 73.0169 },
}

/**
 * Normalize state/union territory names for lookup.
 */
function normalizeStateName(state) {
  if (!state) return ''
  return state
    .toString()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[\.']/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getStateCenterCoords(state) {
  return STATE_CENTER_COORDS[normalizeStateName(state)] || null
}

export { getStateCenterCoords }

/**
 * Build a cache key from market location fields.
 * @param {string} market
 * @param {string} district
 * @param {string} state
 * @returns {string}
 */
function cacheKey(market, district, state) {
  return `${CACHE_PREFIX}${market}-${district}-${state}`
    .toLowerCase()
    .replace(/\s+/g, '_')
}

/**
 * Read a cached coordinate from localStorage.
 * @returns {{ lat: number, lng: number } | null}
 */
function readCache(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

/**
 * Write a coordinate to localStorage cache.
 */
function writeCache(key, coords) {
  try {
    localStorage.setItem(key, JSON.stringify(coords))
  } catch {
    // localStorage full — silently ignore
  }
}

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Query Nominatim for a free-text address.
 * @param {string} query - e.g. "Warangal Market, Warangal, Telangana, India"
 * @returns {{ lat: number, lng: number } | null}
 */
async function queryNominatim(query) {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
    countrycodes: 'in',
  })

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!res.ok) return null

  const data = await res.json()
  if (data && data.length > 0) {
    const { lat, lon } = data[0]
    return { lat: parseFloat(lat), lng: parseFloat(lon) }
  }
  return null
}

/**
 * Geocode a single market location.
 *
 * Strategy:
 *   1. Check localStorage cache — return immediately if found.
 *   2. Try a sequence of increasingly broad Nominatim queries.
 *   3. Fall back to state center coordinates if all lookups fail.
 *   4. Cache the result so repeated visits are fast.
 *
 * @param {string} market
 * @param {string} district
 * @param {string} state
 * @returns {Promise<{ lat: number, lng: number } | null>}
 */
export async function geocodeAddress(market, district, state) {
  const key = cacheKey(market, district, state)
  const cached = readCache(key)
  if (cached) {
    if (cached.lat === null || cached.lng === null) {
      const fallback = getStateCenterCoords(state)
      if (fallback) return fallback
      return null
    }
    return cached
  }

  const queries = [
    `${market}, ${district}, ${state}, India`,
    `${market}, ${state}, India`,
    `${district}, ${state}, India`,
    `${state}, India`,
  ]

  let coords = null
  for (const query of queries) {
    coords = await queryNominatim(query)
    if (coords) break
  }

  if (!coords) {
    coords = getStateCenterCoords(state)
  }

  if (coords) {
    writeCache(key, coords)
  } else {
    writeCache(key, { lat: null, lng: null })
  }

  return coords
}

/**
 * Batch-geocode an array of unique location objects.
 * Rate-limited to 1 request per second.
 *
 * @param {Array<{ market: string, district: string, state: string }>} locations
 * @param {(completed: number, total: number) => void} onProgress
 * @param {AbortSignal} [signal] - optional abort signal
 * @returns {Promise<Map<string, { lat: number, lng: number }>>}
 */
export async function batchGeocode(locations, onProgress, signal) {
  const results = new Map()
  let completed = 0

  for (const loc of locations) {
    // Check for abort
    if (signal?.aborted) break

    const key = cacheKey(loc.market, loc.district, loc.state)
    const cached = readCache(key)

    if (cached) {
      if (cached.lat !== null && cached.lng !== null) {
        results.set(key, cached)
      }
      completed++
      onProgress?.(completed, locations.length)
      continue
    }

    // Not cached — need to call API
    try {
      const coords = await geocodeAddress(loc.market, loc.district, loc.state)
      if (coords) {
        results.set(key, coords)
      }
    } catch (err) {
      console.warn(`[geocodeService] Failed to geocode "${loc.market}, ${loc.district}, ${loc.state}":`, err)
    }

    completed++
    onProgress?.(completed, locations.length)

    // Rate limit: wait 1.1s between API calls (cached lookups skip this)
    if (completed < locations.length && !signal?.aborted) {
      await sleep(1100)
    }
  }

  return results
}

/**
 * Generate a cache key for a market record.
 * Exported so consumers can match geocode results to records.
 */
export { cacheKey }
