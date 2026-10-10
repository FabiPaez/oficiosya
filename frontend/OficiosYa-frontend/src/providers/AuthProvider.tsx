import {
  useState,
  type ReactNode,
} from 'react'
import {
  AuthContext,
  type AuthContextValue,
} from '../context/authContext'
import type { User } from '../types/user'

const AUTH_STORAGE_KEY = 'oficiosya-auth-user'

interface AuthProviderProps {
  children: ReactNode
}

function getStoredUser(): User | null {
  const storedUser =
    localStorage.getItem(AUTH_STORAGE_KEY)

  if (!storedUser) {
    return null
  }

  try {
    const parsedUser = JSON.parse(storedUser) as User

    if (!parsedUser.id || !parsedUser.role) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }

    return parsedUser
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(
    getStoredUser,
  )

  function loginMock(nextUser: User) {
    setUser(nextUser)

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify(nextUser),
    )
  }

  function logoutMock() {
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
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