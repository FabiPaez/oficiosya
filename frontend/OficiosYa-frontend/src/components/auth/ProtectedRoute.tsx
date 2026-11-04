import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { UserRole } from '../../types/user'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
  disallowedRoles?: UserRole[]
}

function ProtectedRoute({
  allowedRoles,
  disallowedRoles,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return <p>Cargando sesión...</p>
  }

  if (!isAuthenticated || !user) {
    const isOnlyAdmin =
      allowedRoles?.length === 1 && allowedRoles[0] === 'ADMIN'
    const loginTarget = isOnlyAdmin
      ? '/admin/login'
      : `/login?redirect=${encodeURIComponent(location.pathname)}`

    return <Navigate to={loginTarget} replace />
  }

  const userRoles = user.roles?.length
    ? user.roles
    : [user.role]

  if (
    allowedRoles &&
    !allowedRoles.some((role) => userRoles.includes(role))
  ) {
    return <Navigate to="/404" replace />
  }

  if (
    disallowedRoles?.some((role) => userRoles.includes(role))
  ) {
    return <Navigate to="/mi-perfil" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
