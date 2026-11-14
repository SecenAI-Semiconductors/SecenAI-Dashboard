/**
 * insuranceApi.js
 *
 * Thin wrapper around insuranceService for the farmer CropInsurance page.
 * All calls go through /api/farmer/insurance — the server sets farmerId
 * from the JWT, so we never send farmerId in the body.
 */

import insuranceService from '../../../../services/insuranceService'

/** Fetch only the logged-in farmer's own requests. */
export async function fetchInsuranceRequests() {
  return insuranceService.getMyInsurance()
}

/** Fetch a single request by ID (ownership enforced server-side). */
export async function fetchInsuranceById(id) {
  return insuranceService.getMyInsuranceById(id)
}

/** Submit a new insurance application. */
export async function submitInsurance(data) {
  return insuranceService.createMine(data)
}

/** Update an existing application (ownership enforced server-side). */
export async function updateInsurance(id, data) {
  return insuranceService.updateMine(id, data)
}

/** Delete an application (ownership enforced server-side). */
export async function deleteInsurance(id) {
  return insuranceService.deleteMine(id)
}

export { insuranceService }
