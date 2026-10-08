import { createContext } from 'react'
import type { User } from '../types/user'

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  loginMock: (user: User) => void
  logoutMock: () => void
}

export const AuthContext =
  createContext<AuthContextValue | undefined>(undefined)