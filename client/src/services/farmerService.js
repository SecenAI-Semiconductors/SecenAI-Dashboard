import api from './api'

/**
 * Farmer CRUD service — all farmer-related API calls.
 * Uses the shared Axios instance (environment-configured base URL).
 */
const farmerService = {
  /** GET /users — Fetch all farmers */
  async getAll() {
    const response = await api.get('/users')
    return response.data
  },

  /** GET /users/:id — Fetch single farmer */
  async getById(id) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  /** POST /users — Create a new farmer */
  async create(farmerData) {
    const response = await api.post('/users', farmerData)
    return response.data
  },

  /** PUT /users/:id — Update an existing farmer */
  async update(id, farmerData) {
    const response = await api.put(`/users/${id}`, farmerData)
    return response.data
  },

  /** DELETE /users/:id — Delete a farmer */
  async delete(id) {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },
}

export default farmerService
