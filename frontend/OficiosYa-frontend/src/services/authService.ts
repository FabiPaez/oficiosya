import type { User } from '../types/user'
import { ACCESS_TOKEN_KEY, apiFetch } from './api'

export interface RegisterUserData {
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  password: string
}


interface AuthResponse {
  success: boolean
  data: {
    user: {
      id: string
      email?: string
      created_at?: string
      roles?: User['role'][]
    }
    session: {
      access_token: string
      refresh_token: string
    }
  }
}


interface ProfileResponse {
  success: boolean
  data: {
    id: string
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
    department?: string | null
    city?: string | null
    created_at?: string
  }
}

async function fetchProfile(): Promise<ProfileResponse['data']> {
  const response = await apiFetch<ProfileResponse>('/profiles/me')
  return response.data
}


function mapUser(
  authUser: AuthResponse['data']['user'],
  profile: ProfileResponse['data'],
): User {
  const roles = [...new Set<User['role']>(
    authUser.roles?.length ? authUser.roles : ['CLIENT'],
  )]

  const role: User['role'] = roles.includes('ADMIN')
    ? 'ADMIN'
    : roles.includes('PROVIDER')
      ? 'PROVIDER'
      : 'CLIENT'

  return {
    id: authUser.id,
    firstName: profile.first_name ?? '',
    lastName: profile.last_name ?? '',
    email: authUser.email ?? '',
    phone: profile.phone ?? '',
    role,
    roles,
    department: profile.department ?? profile.city ?? '',
    createdAt:
      profile.created_at ??
      authUser.created_at ??
      new Date().toISOString(),
    active: true,
  }
}


export const authService = {

  async login(email: string, password: string): Promise<User> {
    const response = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    })

    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      response.data.session.access_token,
    )

    try {
      const currentUser = await this.getCurrentUser()

      if (!currentUser) {
        throw new Error(
          'No se pudo recuperar el perfil después de iniciar sesión.',
        )
      }

      return currentUser
    } catch (error) {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      throw error
    }
  },

  async register(data: RegisterUserData): Promise<User> {
    const response = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone.trim(),
      }),
    })

    const accessToken = response.data.session?.access_token

    if (!accessToken) {
      throw new Error(
        'La cuenta se creó, pero falta confirmar el correo antes de iniciar sesión.',
      )
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)

    try {
      await apiFetch('/profiles/me', {
        method: 'PATCH',
        body: JSON.stringify({
          department: data.department.trim(),
        }),
      })

      const profile = await fetchProfile()
      return mapUser(response.data.user, profile)
    } catch (error) {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      throw error
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)

    if (!token) {
      return null
    }

    try {
      const response = await apiFetch<{
        success: boolean
        data: {
          user: AuthResponse['data']['user']
        }
      }>('/auth/me')

      const profile = await fetchProfile()

      return mapUser(response.data.user, profile)
    } catch {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      return null
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  },
}