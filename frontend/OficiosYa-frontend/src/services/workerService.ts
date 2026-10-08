import { mockWorkers } from '../data/mockWorkers'
import type { Worker } from '../types/worker'
import type { WorkerSearchFilters } from '../types/search'
import { normalizeText } from '../utils/normalizeText'

export const workerService = {
  async getAll(): Promise<Worker[]> {
    return Promise.resolve(
      mockWorkers.filter((worker) => worker.active),
    )
  },

  async getById(id: string): Promise<Worker | null> {
    const worker = mockWorkers.find(
      (item) => item.id === id && item.active,
    )

    return Promise.resolve(worker ?? null)
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

    return Promise.resolve(workers)
  },
}