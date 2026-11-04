import { apiFetch } from './api'
import type { Favorite } from '../types/favorite'
import { mockFavorites } from '../data/mockFavorites'
import { mockWorkers } from '../data/mockWorkers'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface FavoriteRecord {
  user_id?: string
  provider_id: string
  created_at: string
  profiles?: {
    id: string
    first_name: string | null
    last_name: string | null
    phone: string | null
    profile_image_url: string | null
    description: string | null
    city: string | null
    department: string | null
  } | null
}

function mapFavorite(
  record: FavoriteRecord,
  clientId: string,
): Favorite {
  return {
    id: `${clientId}:${record.provider_id}`,
    clientId,
    workerId: record.provider_id,
    createdAt: record.created_at,
  }
}

export const favoriteService = {
  async getByClientId(
    clientId: string,
  ): Promise<Favorite[]> {
    try {
      const response = await apiFetch<ApiResponse<FavoriteRecord[]>>(
        '/favorites',
      )

      if (response && response.success && Array.isArray(response.data)) {
        return response.data.map((record) =>
          mapFavorite(record, clientId),
        )
      }
    } catch {
      // Fallback offline / tests
      return mockFavorites.filter((favorite) => favorite.clientId === clientId)
    }

    return mockFavorites.filter((favorite) => favorite.clientId === clientId)
  },

  async isFavorite(
    clientId: string,
    workerId: string,
  ): Promise<boolean> {
    const worker = mockWorkers.find((item) => item.id === workerId)
    if (clientId === workerId || worker?.userId === clientId) {
      return false
    }

    const favorites = await this.getByClientId(clientId)

    return favorites.some(
      (favorite) => favorite.workerId === workerId,
    )
  },

  async add(
    clientId: string,
    workerId: string,
  ): Promise<Favorite> {
    const worker = mockWorkers.find((item) => item.id === workerId)
    if (clientId === workerId || worker?.userId === clientId) {
      throw new Error(
        'No podés agregar tu propio perfil a favoritos.',
      )
    }

    try {
      const response = await apiFetch<ApiResponse<FavoriteRecord>>(
        '/favorites',
        {
          method: 'POST',
          body: JSON.stringify({
            providerId: workerId,
          }),
        },
      )

      if (response && response.success && response.data) {
        return mapFavorite(response.data, clientId)
      }
    } catch {
      // Fallback offline / tests
      const existing = mockFavorites.find(
        (fav) => fav.clientId === clientId && fav.workerId === workerId,
      )

      if (existing) {
        return existing
      }

      const newFav: Favorite = {
        id: `favorite-${Date.now()}`,
        clientId,
        workerId,
        createdAt: new Date().toISOString(),
      }

      mockFavorites.push(newFav)
      return newFav
    }

    const newFav: Favorite = {
      id: `favorite-${Date.now()}`,
      clientId,
      workerId,
      createdAt: new Date().toISOString(),
    }
    mockFavorites.push(newFav)
    return newFav
  },

  async remove(
    clientId: string,
    workerId: string,
  ): Promise<void> {
    try {
      await apiFetch<ApiResponse<{ providerId: string }>>(
        `/favorites/${encodeURIComponent(workerId)}`,
        {
          method: 'DELETE',
        },
      )
    } catch {
      // Fallback offline / tests
      const index = mockFavorites.findIndex(
        (fav) =>
          (fav.clientId === clientId || !clientId) &&
          fav.workerId === workerId,
      )

      if (index !== -1) {
        mockFavorites.splice(index, 1)
      }
      return
    }

    const index = mockFavorites.findIndex(
      (fav) =>
        (fav.clientId === clientId || !clientId) &&
        fav.workerId === workerId,
    )

    if (index !== -1) {
      mockFavorites.splice(index, 1)
    }
  },
}
