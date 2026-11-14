/**
 * api.js — shared Axios instance
 *
 * Adds two interceptors on top of the existing X-API-Key header:
 *
 * Request interceptor:
 *   Reads the JWT from localStorage and attaches it as
 *   "Authorization: Bearer <token>" to every outgoing request.
 *   Reading from localStorage (not React state) means this works
 *   outside the React component tree (e.g. from service files).
 *
 * Response interceptor:
 *   On 401, clears the stored token and redirects to /login.
 *   Uses window.location so it works outside React Router context.
 */

import axios from 'axios'

const TOKEN_KEY = 'secenai_token'

/**
 * Shared Axios instance configured with the environment-based API URL.
 * All API calls in the app should use this instance.
 */
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, ''),
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': import.meta.env.VITE_API_SECRET_KEY || '',
  },
  timeout: 30000,
})

// ── Request interceptor: attach JWT ─────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: handle 401 ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem(TOKEN_KEY)

      // Clear stored token so the app knows the session is gone
      localStorage.removeItem(TOKEN_KEY)

      // Only hard-redirect when there was an actual session to lose.
      // This prevents stale in-flight requests (e.g. from an unmounting page)
      // from hijacking a React Router navigation the user just triggered.
      if (hadToken && !window.location.pathname.startsWith('/login')) {
        window.location.replace('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api
