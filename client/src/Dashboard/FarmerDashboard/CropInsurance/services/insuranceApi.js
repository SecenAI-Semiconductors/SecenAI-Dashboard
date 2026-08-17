/**
 * insuranceApi.js
 *
 * Thin wrapper around the global insuranceService.
 * Provides module-specific defaults so all CropInsurance
 * components share one fetch strategy.
 */

import insuranceService from '../../../../services/insuranceService'

/**
 * Fetch all insurance requests.
 * @returns {Promise<Array>}
 */
export async function fetchInsuranceRequests() {
  return insuranceService.getAll()
}

/**
 * Fetch a single insurance request by ID.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function fetchInsuranceById(id) {
  return insuranceService.getById(id)
}

/**
 * Submit a new insurance application.
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function submitInsurance(data) {
  return insuranceService.create(data)
}

/**
 * Update an existing insurance application.
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateInsurance(id, data) {
  return insuranceService.update(id, data)
}

/**
 * Delete an insurance application.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function deleteInsurance(id) {
  return insuranceService.delete(id)
}

export { insuranceService }
