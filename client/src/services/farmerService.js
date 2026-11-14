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

  /**
   * Legacy create — now hits the locked /api/users endpoint (admin-only via JWT).
   * Kept for backward compatibility with edit paths.
   */
  async create(farmerData) {
    const response = await api.post('/api/users', farmerData)
    return response.data
  },

  /**
   * Admin creates a farmer account via the new auth-aware endpoint.
   * Returns { farmer, temporaryPassword } — password shown once.
   */
  async createWithAuth(farmerData) {
    const response = await api.post('/api/admin/farmers', farmerData)
    return response.data   // { farmer, temporaryPassword }
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
