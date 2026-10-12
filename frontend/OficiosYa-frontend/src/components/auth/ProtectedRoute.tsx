import { Navigate, Outlet } from 'react-router-dom'
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
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
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