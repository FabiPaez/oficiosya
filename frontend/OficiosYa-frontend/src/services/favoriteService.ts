import { apiFetch } from './api'
import type { Favorite } from '../types/favorite'

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
    const response = await apiFetch<ApiResponse<FavoriteRecord[]>>(
      '/favorites',
    )

    return response.data.map((record) =>
      mapFavorite(record, clientId),
    )
  },

  async isFavorite(
    clientId: string,
    workerId: string,
  ): Promise<boolean> {
    if (clientId === workerId) {
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
    if (clientId === workerId) {
      throw new Error(
        'No podés agregar tu propio perfil a favoritos.',
      )
    }

    const response = await apiFetch<ApiResponse<FavoriteRecord>>(
      '/favorites',
      {
        method: 'POST',
        body: JSON.stringify({
          providerId: workerId,
        }),
      },
    )

    return mapFavorite(response.data, clientId)
  },

  async remove(
    _clientId: string,
    workerId: string,
  ): Promise<void> {
    await apiFetch<ApiResponse<{ providerId: string }>>(
      `/favorites/${encodeURIComponent(workerId)}`,
      {
        method: 'DELETE',
      },
    )
  },

}