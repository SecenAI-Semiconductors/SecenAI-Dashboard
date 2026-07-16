import axios from 'axios'

/**
 * AGMARKNET Mandi Price Service
 *
 * Calls the data.gov.in Open Government Data API directly from the browser.
 * Resource: "Current Daily Price of Various Commodities from Various Markets (Mandi)"
 *
 * No backend changes — this is a pure frontend call.
 */

const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070'
const BASE_URL = 'https://api.data.gov.in/resource'

/**
 * Fetch mandi prices from data.gov.in
 *
 * @param {Object} params
 * @param {string} [params.commodity] - Filter by commodity name
 * @param {string} [params.state]     - Filter by state name
 * @param {string} [params.district]  - Filter by district name
 * @param {string} [params.market]    - Filter by market/APMC name
 * @param {number} [params.limit=20]  - Results per page
 * @param {number} [params.offset=0]  - Pagination offset
 * @returns {Promise<{ records: Array, total: number, count: number }>}
 */
export async function fetchMandiPrices({
  commodity = '',
  state = '',
  district = '',
  market = '',
  limit = 20,
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
  if (state.trim()) params['filters[state]'] = state.trim()
  if (district.trim()) params['filters[district]'] = district.trim()
  if (market.trim()) params['filters[market]'] = market.trim()
  if (commodity.trim()) params['filters[commodity]'] = commodity.trim()

  const url = `${BASE_URL}/${RESOURCE_ID}`

  try {
    // Try direct call first
    const response = await axios.get(url, { params, timeout: 15000 })
    return normalizeResponse(response.data)
  } catch (err) {
    // If CORS blocks, try via allorigins proxy
    if (err.message?.includes('Network Error') || err.code === 'ERR_NETWORK') {
      const queryString = new URLSearchParams(params).toString()
      const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
        `${url}?${queryString}`
      )}`

      const proxyResponse = await axios.get(proxiedUrl, { timeout: 20000 })
      const data =
        typeof proxyResponse.data === 'string'
          ? JSON.parse(proxyResponse.data)
          : proxyResponse.data
      return normalizeResponse(data)
    }

    throw err
  }
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
