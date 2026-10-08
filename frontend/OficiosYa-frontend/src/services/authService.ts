import { mockUsers } from '../data/mockUsers'
import type { User } from '../types/user'

export const authService = {
  async login(email: string): Promise<User | null> {
    const user = mockUsers.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.active,
    )

    return Promise.resolve(user ?? null)
  },

  async getCurrentUser(): Promise<User | null> {
    return Promise.resolve(null)
  },

  async logout(): Promise<void> {
    return Promise.resolve()
  },
}