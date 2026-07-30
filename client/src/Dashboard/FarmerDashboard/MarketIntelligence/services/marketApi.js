/**
 * marketApi.js
 *
 * Thin wrapper around the global agmarknetService.
 * Provides market-intelligence-specific defaults (higher limit)
 * so all MI components share one fetch strategy.
 */

import { fetchMandiPrices } from '../../../../services/agmarknetService'

const MI_DEFAULT_LIMIT = 500

/**
 * Fetch a large batch of mandi prices for the Market Intelligence page.
 * All MI sections derive their data from this single fetch.
 *
 * @param {Object} params — same shape as fetchMandiPrices
 * @returns {Promise<{ records: Array, total: number, count: number }>}
 */
export async function fetchMarketData({
  commodity = '',
  state = '',
  district = '',
  market = '',
  limit = MI_DEFAULT_LIMIT,
  offset = 0,
} = {}) {
  return fetchMandiPrices({ commodity, state, district, market, limit, offset })
}

export { fetchMandiPrices }
