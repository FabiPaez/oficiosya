import { createContext } from 'react'
import type { User } from '../types/user'
import type { RegisterUserData } from '../services/authService'

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isInitializing: boolean
  loginMock: (user: User) => void
  registerMock: (data: RegisterUserData) => Promise<User | null>
  logoutMock: () => void
  registerAsProvider: () => void
}

export const AuthContext =
  createContext<AuthContextValue | undefined>(undefined)