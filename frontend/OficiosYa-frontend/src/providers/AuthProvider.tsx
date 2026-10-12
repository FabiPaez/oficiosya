import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  AuthContext,
  type AuthContextValue,
} from '../context/authContext'
import {
  authService,
  type RegisterUserData,
} from '../services/authService'
import { ACCESS_TOKEN_KEY } from '../services/api'
import type { User, UserRole } from '../types/user'

const AUTH_STORAGE_KEY = 'oficiosya-auth-user'

interface AuthProviderProps {
  children: ReactNode
}

function getStoredUser(): User | null {
  try {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)


    if (!storedUser) return null

    const parsedUser = JSON.parse(storedUser) as User

    if (!parsedUser.id || !parsedUser.role) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }

    const roles = parsedUser.roles?.length
      ? parsedUser.roles
      : [parsedUser.role]

    return {
      ...parsedUser,
      roles: [...new Set([parsedUser.role, ...roles])],
    }


  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(getStoredUser)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let active = true


    async function restoreSession() {
      try {
        const currentUser = await authService.getCurrentUser()

        if (active) {
          if (currentUser) {
            saveUser(currentUser)
          } else {
            setUser(null)
            localStorage.removeItem(AUTH_STORAGE_KEY)
          }
        }
      } catch {
        if (active) {
          setUser(null)
          localStorage.removeItem(AUTH_STORAGE_KEY)
          localStorage.removeItem(ACCESS_TOKEN_KEY)
        }
      } finally {
        if (active) {
          setIsInitializing(false)
        }
      }
    }

    void restoreSession()

    return () => {
      active = false
    }


  }, [])

  function saveUser(nextUser: User) {
    const currentRoles = nextUser.roles ?? [nextUser.role]


    const normalizedUser: User = {
      ...nextUser,
      roles: [...new Set<UserRole>([
        nextUser.role,
        ...currentRoles,
      ])],
    }

    setUser(normalizedUser)

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify(normalizedUser),
    )

  }

  function loginMock(nextUser: User) {
    saveUser(nextUser)
  }

  async function registerMock(
    data: RegisterUserData,
  ): Promise<User | null> {
    const newUser = await authService.register(data)


    if (!newUser) return null

    saveUser(newUser)

    return newUser


  }

  function logoutMock() {
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
    void authService.logout()
  }

  function registerAsProvider() {
    if (!user) return


    const currentRoles = user.roles ?? [user.role]

    const updatedUser: User = {
      ...user,
      roles: [
        ...new Set<UserRole>([
          ...currentRoles,
          'PROVIDER',
        ]),
      ],
    }

    saveUser(updatedUser)


  }


  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null && !isInitializing,
    isInitializing,
    loginMock,
    registerMock,
    logoutMock,
    registerAsProvider,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}