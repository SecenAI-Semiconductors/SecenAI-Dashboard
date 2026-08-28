import soilService from '../../../../services/soilService'

export async function fetchLatestSoil(farmerId) {
  return soilService.getLatest(farmerId)
}

export async function fetchSoilHistory(farmerId) {
  return soilService.getHistory(farmerId)
}

export { soilService }
