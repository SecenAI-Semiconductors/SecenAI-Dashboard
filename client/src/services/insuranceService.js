import api from './api'

const insuranceService = {
  // ── Farmer-scoped (use /api/farmer/insurance) ─────────────────────────────
  // farmerId is set server-side from the JWT — never send it in the body.

  async getMyInsurance() {
    const response = await api.get('/api/farmer/insurance')
    return response.data
  },

  async createMine(data) {
    const response = await api.post('/api/farmer/insurance', data)
    return response.data
  },

  async getMyInsuranceById(id) {
    const response = await api.get(`/api/farmer/insurance/${id}`)
    return response.data
  },

  async updateMine(id, data) {
    const response = await api.put(`/api/farmer/insurance/${id}`, data)
    return response.data
  },

  async deleteMine(id) {
    const response = await api.delete(`/api/farmer/insurance/${id}`)
    return response.data
  },

  // ── Admin-scoped (use /api/admin/insurance) ────────────────────────────────

  async getAllAdmin() {
    const response = await api.get('/api/admin/insurance')
    return response.data
  },

  async approveAdmin(id, adminRemarks) {
    const response = await api.patch(`/api/admin/insurance/${id}/approve`, { adminRemarks })
    return response.data
  },

  async rejectAdmin(id, adminRemarks) {
    const response = await api.patch(`/api/admin/insurance/${id}/reject`, { adminRemarks })
    return response.data
  },

  async reviewAdmin(id, adminRemarks) {
    const response = await api.patch(`/api/admin/insurance/${id}/review`, { adminRemarks })
    return response.data
  },

}

export default insuranceService
