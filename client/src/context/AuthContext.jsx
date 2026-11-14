/**
 * AuthContext.jsx
 *
 * Global authentication state for the SecenAI platform.
 *
 * Provides: user, role, token, loading, login, register, logout
 *
 * On mount: attempts to restore session from localStorage via GET /api/auth/me.
 * Token is kept in localStorage so the axios interceptor can read it without
 * needing React context (avoids circular-dependency issues).
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'secenai_token'

export function AuthProvider({ children }) {
  const navigate = useNavigate()

  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)   // true until session restore completes

  // ── Persist token to localStorage whenever it changes ────────────
  const saveToken = useCallback((t) => {
    if (t) {
      localStorage.setItem(TOKEN_KEY, t)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
    setToken(t)
  }, [])

  // ── Clear all auth state ──────────────────────────────────────────
  const clearAuth = useCallback(() => {
    saveToken(null)
    setUser(null)
  }, [saveToken])

  // ── Restore session on mount via GET /api/auth/me ─────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (!storedToken) {
      setLoading(false)
      return
    }

    api.get('/api/auth/me')
      .then(res => {
        setUser(res.data)
        setToken(storedToken)
      })
      .catch(() => {
        // Token invalid/expired — clear it
        clearAuth()
      })
      .finally(() => setLoading(false))
  }, [clearAuth])

  // ── login(identifier, password) ───────────────────────────────────
  const login = useCallback(async (identifier, password) => {
    const res = await api.post('/api/auth/login', { identifier, password })
    saveToken(res.data.token)
    setUser(res.data.user)
    return res.data   // { token, user }
  }, [saveToken])

  // ── register(name, phone, password, district?, state?) ────────────
  const register = useCallback(async (formData) => {
    const res = await api.post('/api/auth/register', formData)
    saveToken(res.data.token)
    setUser(res.data.user)
    return res.data
  }, [saveToken])

  // ── logout() ──────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearAuth()
    navigate('/', { replace: true })
  }, [clearAuth, navigate])

  const value = {
    user,
    role:    user?.role ?? null,
    token,
    loading,
    login,
    register,
    logout,
    setUser,       // exposed so change-password / profile pages can update user
    clearAuth,     // exposed for the axios 401 interceptor
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** @returns {ReturnType<typeof import('./AuthContext').AuthProvider>} */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

