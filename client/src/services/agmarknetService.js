import api from './api'

/**
 * AGMARKNET Mandi Price Service
 *
 * Routes all requests through our Express backend (/api/market/prices),
 * which calls data.gov.in server-side — avoiding browser CORS restrictions.
 */

/**
 * Fetch mandi prices via the backend proxy.
 *
 * @param {Object} params
 * @param {string} [params.commodity] - Filter by commodity name
 * @param {string} [params.state]     - Filter by state name
 * @param {string} [params.district]  - Filter by district name
 * @param {string} [params.market]    - Filter by market/APMC name
 * @param {number} [params.limit=500] - Results per page (max 1000)
 * @param {number} [params.offset=0]  - Pagination offset
 * @returns {Promise<{ records: Array, total: number, count: number }>}
 */
export async function fetchMandiPrices({
  commodity = '',
  state     = '',
  district  = '',
  market    = '',
  limit     = 500,
  offset    = 0,
} = {}) {
  const params = { limit, offset }
  if (commodity.trim()) params.commodity = commodity.trim()
  if (state.trim())     params.state     = state.trim()
  if (district.trim())  params.district  = district.trim()
  if (market.trim())    params.market    = market.trim()

  const res = await api.get('/api/market/prices', { params })
  return normalizeResponse(res.data)
}

/**
 * Normalize the data.gov.in response into a clean shape.
 */
function normalizeResponse(data) {
  const records = (data.records || []).map((r) => ({
    commodity:   r.commodity   || r.Commodity   || '',
    variety:     r.variety     || r.Variety     || '',
    state:       r.state       || r.State       || '',
    district:    r.district    || r.District    || '',
    market:      r.market      || r.Market      || '',
    minPrice:    r.min_price   || r.Min_Price   || r.min_price_rs_quintal   || '—',
    maxPrice:    r.max_price   || r.Max_Price   || r.max_price_rs_quintal   || '—',
    modalPrice:  r.modal_price || r.Modal_Price || r.modal_price_rs_quintal || '—',
    arrivalDate: r.arrival_date || r.Arrival_Date || '—',
  }))

  return {
    records,
    total: data.total || 0,
    count: data.count || records.length,
  }
}
