import { mockReviews } from '../data/mockReviews'
import type { Review } from '../types/review'

export const reviewService = {
  async getByWorkerId(workerId: string): Promise<Review[]> {
    return Promise.resolve(
      mockReviews.filter((review) => review.workerId === workerId),
    )
  },

  async getByClientId(clientId: string): Promise<Review[]> {
    return Promise.resolve(
      mockReviews.filter((review) => review.clientId === clientId),
    )
  },
}