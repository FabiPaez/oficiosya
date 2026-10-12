import { mockWorkers } from '../data/mockWorkers'
import { mockReviews } from '../data/mockReviews'
import type { Worker } from '../types/worker'
import type { WorkerSearchFilters } from '../types/search'
import { normalizeText } from '../utils/normalizeText'

export type CreateMockWorkerData = Omit<
  Worker,
  'id' | 'ratingAverage' | 'reviewCount' | 'premium' | 'active'
>

export type UpdateMockWorkerData = Pick<
  Worker,
  | 'description'
  | 'phone'
  | 'whatsapp'
  | 'department'
  | 'zones'
  | 'coverage'
  | 'categories'
  | 'photoUrl'
  | 'workPhotoUrls'
  | 'experienceYears'
  | 'schedule'
  | 'availableDays'
>

function withReviewMetrics(worker: Worker): Worker {
  const reviews = mockReviews.filter(
    (review) => review.workerId === worker.id,
  )

  const ratingAverage =
    reviews.length > 0
      ? reviews.reduce(
        (total, review) => total + review.rating,
        0,
      ) / reviews.length
      : 0

  return {
    ...worker,
    ratingAverage,
    reviewCount: reviews.length,
  }
}

export const workerService = {
  async getAll(): Promise<Worker[]> {
    return mockWorkers
      .filter((worker) => worker.active)
      .map(withReviewMetrics)
  },

  async getById(id: string): Promise<Worker | null> {
    const worker = mockWorkers.find(
      (item) => item.id === id && item.active,
    )

    return Promise.resolve(
      worker ? withReviewMetrics(worker) : null,
    )
  },

  async search(
    filters: WorkerSearchFilters,
  ): Promise<Worker[]> {
    const normalizedQuery = normalizeText(
      filters.query ?? '',
    )

    const normalizedZone = normalizeText(
      filters.zone ?? '',
    )

    const workers = mockWorkers.filter((worker) => {
      if (!worker.active) {
        return false
      }

      const searchableText = normalizeText(
        [
          worker.firstName,
          worker.lastName,
          worker.description,
          ...worker.categories,
          ...worker.zones,
        ].join(' '),
      )

      const matchesQuery =
        normalizedQuery === '' ||
        searchableText.includes(normalizedQuery)

      const matchesCategory =
        !filters.categoryId ||
        worker.categories.includes(filters.categoryId)

      const matchesZone =
        normalizedZone === '' ||
        worker.zones.some(
          (workerZone) =>
            normalizeText(workerZone) === normalizedZone,
        )

      return (
        matchesQuery &&
        matchesCategory &&
        matchesZone
      )
    })

    return workers.map(withReviewMetrics)
  },

  async updateMock(
    id: string,
    data: UpdateMockWorkerData,
  ): Promise<Worker | null> {
    const worker = mockWorkers.find(
      (item) => item.id === id,
    )

    if (!worker) {
      return null
    }

    Object.assign(worker, data)

    return withReviewMetrics(worker)
  },

  async createMock(
    data: CreateMockWorkerData,
  ): Promise<Worker> {
    const worker: Worker = {
      ...data,
      id: `worker-${Date.now()}`,
      ratingAverage: 0,
      reviewCount: 0,
      premium: false,
      active: true,
    }

    mockWorkers.push(worker)

    return withReviewMetrics(worker)
  },
}