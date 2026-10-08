import {
  useState,
  type ReactNode,
} from 'react'
import {
  AuthContext,
  type AuthContextValue,
} from '../context/authContext'
import type { User } from '../types/user'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)

  function loginMock(nextUser: User) {
    setUser(nextUser)
  }

  function logoutMock() {
    setUser(null)
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    loginMock,
    logoutMock,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}