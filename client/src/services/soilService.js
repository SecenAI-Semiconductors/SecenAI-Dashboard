import api from './api'

const soilService = {
  async getLatest(farmerId) {
    const response = await api.get(`/api/soil/${farmerId}`)
    return response.data
  },

  async getHistory(farmerId) {
    const response = await api.get(`/api/soil/${farmerId}/history`)
    return response.data
  }
}

export default soilService
