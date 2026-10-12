import { describe, expect, it } from 'vitest'
import { mockReviews } from '../../data/mockReviews'
import { reviewService } from '../reviewService'

describe('reviewService', () => {
  it('devuelve únicamente las reseñas del trabajador solicitado', async () => {
    const workerId = mockReviews[0]?.workerId

    expect(workerId).toBeDefined()
    if (!workerId) return

    const result = await reviewService.getByWorkerId(workerId)

    expect(result.length).toBeGreaterThan(0)
    expect(result.every((review) => review.workerId === workerId)).toBe(true)
  })

  it('devuelve únicamente las reseñas del cliente solicitado', async () => {
    const clientId = mockReviews[0]?.clientId

    expect(clientId).toBeDefined()
    if (!clientId) return

    const result = await reviewService.getByClientId(clientId)

    expect(result.length).toBeGreaterThan(0)
    expect(result.every((review) => review.clientId === clientId)).toBe(true)
  })

  it('devuelve una lista vacía para un trabajador sin reseñas', async () => {
    await expect(
      reviewService.getByWorkerId('worker-sin-resenas'),
    ).resolves.toEqual([])
  })

  it('devuelve una lista vacía para un cliente sin reseñas', async () => {
    await expect(
      reviewService.getByClientId('client-sin-resenas'),
    ).resolves.toEqual([])
  })
})