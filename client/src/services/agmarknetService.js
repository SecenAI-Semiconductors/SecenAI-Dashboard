import axios from 'axios'

/**
 * AGMARKNET Mandi Price Service
 *
 * Calls the data.gov.in Open Government Data API via the Vite dev proxy
 * to bypass CORS. The proxy is configured in vite.config.js:
 *   /api/agmarknet/* → https://api.data.gov.in/*
 *
 * No backend changes — this is a pure frontend + dev-tooling call.
 */

const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070'

/**
 * Fetch mandi prices from data.gov.in
 *
 * @param {Object} params
 * @param {string} [params.commodity] - Filter by commodity name
 * @param {string} [params.state]     - Filter by state name
 * @param {string} [params.district]  - Filter by district name
 * @param {string} [params.market]    - Filter by market/APMC name
 * @param {number} [params.limit=10]  - Results per page
 * @param {number} [params.offset=0]  - Pagination offset
 * @returns {Promise<{ records: Array, total: number, count: number }>}
 */
export async function fetchMandiPrices({
  commodity = '',
  state = '',
  district = '',
  market = '',
  limit = 10,
  offset = 0,
} = {}) {
  const apiKey = import.meta.env.VITE_AGMARKNET_API_KEY

  if (!apiKey) {
    throw new Error(
      'AGMARKNET API key is not configured. Add VITE_AGMARKNET_API_KEY to your .env file.'
    )
  }

  // Build query params
  const params = {
    'api-key': apiKey,
    format: 'json',
    limit,
    offset,
  }

  // Apply optional filters (data.gov.in uses filters[field_name] syntax)
  if (state.trim()) params['filters[state.keyword]'] = state.trim()
  if (district.trim()) params['filters[district]'] = district.trim()
  if (market.trim()) params['filters[market]'] = market.trim()
  if (commodity.trim()) params['filters[commodity]'] = commodity.trim()

  // Use Vite dev proxy to bypass CORS: /api/agmarknet → https://api.data.gov.in
  const url = `/api/agmarknet/resource/${RESOURCE_ID}`

  // Retry up to 2 times on 429 (rate limit) with a delay
  let lastError
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        // Wait before retrying (3s for 2nd attempt, 6s for 3rd)
        await new Promise((r) => setTimeout(r, 3000 * attempt))
      }
      const response = await axios.get(url, { params, timeout: 15000 })
      return normalizeResponse(response.data)
    } catch (err) {
      lastError = err
      if (err.response?.status !== 429) break // only retry on rate limit
    }
  }

  // If we exhausted retries on 429, give a friendly message
  if (lastError?.response?.status === 429) {
    throw new Error(
      'Rate limit exceeded — the sample API key allows limited requests. Please wait a minute and try again, or register your own key at data.gov.in.'
    )
  }

  throw lastError
}

/**
 * Normalize the data.gov.in response into a clean shape.
 * The API returns { records: [...], total: N, count: N, ... }
 */
function normalizeResponse(data) {
  const records = (data.records || []).map((r) => ({
    commodity: r.commodity || r.Commodity || '',
    variety: r.variety || r.Variety || '',
    state: r.state || r.State || '',
    district: r.district || r.District || '',
    market: r.market || r.Market || '',
    minPrice: r.min_price || r.Min_Price || r.min_price_rs_quintal || '—',
    maxPrice: r.max_price || r.Max_Price || r.max_price_rs_quintal || '—',
    modalPrice: r.modal_price || r.Modal_Price || r.modal_price_rs_quintal || '—',
    arrivalDate: r.arrival_date || r.Arrival_Date || '—',
  }))

  return {
    records,
    total: data.total || 0,
    count: data.count || records.length,
  }
}
