/**
 * ProtectedRoute.jsx
 *
 * Guards a route by checking token and role.
 *
 *   - No token         → redirect to /login
 *   - Wrong role       → redirect to the user's own dashboard
 *   - mustChangePassword → redirect to /change-password
 *   - Correct role     → render <Outlet />
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute role="admin" />}>
 *     <Route path="/admin" element={<AdminDashboard />} />
 *   </Route>
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ROLE_HOME = {
  admin:  '/admin',
  farmer: '/farmer',
}

export function ProtectedRoute({ role }) {
  const { user, token, loading } = useAuth()
  const location = useLocation()

  // While session restore is in-flight, render nothing (avoids flash)
  if (loading) return null

  // Not authenticated → /login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Must change password first
  if (user.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  // Wrong role → redirect to the user's own dashboard
  if (role && user.role !== role) {
    const home = ROLE_HOME[user.role] ?? '/'
    return <Navigate to={home} replace />
  }

  return <Outlet />
}

