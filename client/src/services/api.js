import axios from 'axios'

/**
 * Shared Axios instance configured with the environment-based API URL.
 * All API calls in the app should use this instance.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': import.meta.env.VITE_API_SECRET_KEY || '',
  },
  timeout: 15000,
})

export default api

