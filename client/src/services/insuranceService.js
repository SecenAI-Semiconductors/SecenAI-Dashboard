import api from './api'

const insuranceService = {
  async getAll() {
    const response = await api.get('/api/insurance')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/api/insurance/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/api/insurance', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/api/insurance/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/api/insurance/${id}`)
    return response.data
  },
}

export default insuranceService
