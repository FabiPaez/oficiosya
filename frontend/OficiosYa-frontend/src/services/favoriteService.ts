import { mockFavorites } from '../data/mockFavorites'
import type { Favorite } from '../types/favorite'

export const favoriteService = {
  async getByClientId(
    clientId: string,
  ): Promise<Favorite[]> {
    return Promise.resolve(
      mockFavorites.filter(
        (favorite) => favorite.clientId === clientId,
      ),
    )
  },

  async isFavorite(
    clientId: string,
    workerId: string,
  ): Promise<boolean> {
    const favorite = mockFavorites.some(
      (item) =>
        item.clientId === clientId &&
        item.workerId === workerId,
    )

    return Promise.resolve(favorite)
  },

  async add(
    clientId: string,
    workerId: string,
  ): Promise<Favorite> {
    const existingFavorite = mockFavorites.find(
      (item) =>
        item.clientId === clientId &&
        item.workerId === workerId,
    )

    if (existingFavorite) {
      return Promise.resolve(existingFavorite)
    }

    const favorite: Favorite = {
      id: `favorite-${Date.now()}`,
      clientId,
      workerId,
      createdAt: new Date().toISOString(),
    }

    mockFavorites.push(favorite)

    return Promise.resolve(favorite)
  },

  async remove(
    clientId: string,
    workerId: string,
  ): Promise<void> {
    const favoriteIndex = mockFavorites.findIndex(
      (item) =>
        item.clientId === clientId &&
        item.workerId === workerId,
    )

    if (favoriteIndex !== -1) {
      mockFavorites.splice(favoriteIndex, 1)
    }

    return Promise.resolve()
  },
}