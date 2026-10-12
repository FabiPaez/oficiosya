import { beforeEach, describe, expect, it } from 'vitest'
import { mockFavorites } from '../../data/mockFavorites'
import { mockWorkers } from '../../data/mockWorkers'
import { favoriteService } from '../favoriteService'

describe('favoriteService', () => {
  beforeEach(() => {
    mockFavorites.splice(0, mockFavorites.length)
  })

  it('agrega un trabajador a favoritos', async () => {
    const favorite = await favoriteService.add(
      'user-client-001',
      'worker-001',
    )

    expect(favorite.clientId).toBe('user-client-001')
    expect(favorite.workerId).toBe('worker-001')
    expect(mockFavorites).toHaveLength(1)
  })

  it('no duplica un favorito existente', async () => {
    const first = await favoriteService.add(
      'user-client-001',
      'worker-001',
    )
    const second = await favoriteService.add(
      'user-client-001',
      'worker-001',
    )

    expect(second.id).toBe(first.id)
    expect(mockFavorites).toHaveLength(1)
  })

  it('rechaza que un trabajador agregue su propio perfil', async () => {
    const worker = mockWorkers[0]

    expect(worker).toBeDefined()
    if (!worker) return

    await expect(
      favoriteService.add(worker.userId, worker.id),
    ).rejects.toThrow(
      'No podés agregar tu propio perfil a favoritos.',
    )

    expect(mockFavorites).toHaveLength(0)
  })

  it('no considera favorito el propio perfil', async () => {
    const worker = mockWorkers[0]

    expect(worker).toBeDefined()
    if (!worker) return

    await expect(
      favoriteService.isFavorite(worker.userId, worker.id),
    ).resolves.toBe(false)
  })

  it('elimina un favorito existente', async () => {
    await favoriteService.add('user-client-001', 'worker-001')

    await favoriteService.remove('user-client-001', 'worker-001')

    expect(mockFavorites).toHaveLength(0)
  })
})