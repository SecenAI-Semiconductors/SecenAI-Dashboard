import api from './api'

const farmerService = {
  async getAll() {
    const response = await api.get('/api/users')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/api/users/${id}`)
    return response.data
  },

  async create(farmerData) {
    const response = await api.post('/api/users', farmerData)
    return response.data
  },

  async update(id, farmerData) {
    const response = await api.put(`/api/users/${id}`, farmerData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/api/users/${id}`)
    return response.data
  },
}

export default farmerService