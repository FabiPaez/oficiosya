export type UserRole = 'CLIENT' | 'PROVIDER' | 'ADMIN'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: UserRole
  department: string
  createdAt: string
  active: boolean
}