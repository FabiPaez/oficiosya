
import { apiFetch } from './api'
import { mockWorkers } from '../data/mockWorkers'
import type { Worker, CoverageType } from '../types/worker'
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

interface ApiProviderService {
  id: number
  name: string
  description: string | null
  categoryId: string
  categoryName: string
  priceFrom: number | null
  priceTo: number | null
}

interface ApiProviderCategory {
  id: string
  name: string
}

interface ApiProvider {
  id: string
  first_name: string
  last_name: string
  phone: string | null
  profile_image_url: string | null
  description: string | null
  city: string | null
  department: string | null
  created_at: string
  services: ApiProviderService[]
  categories: ApiProviderCategory[]
}

interface ApiProviderItem {
  provider: ApiProvider
  services: ApiProviderService[]
  categories: ApiProviderCategory[]
}

interface ProvidersResponse {
  success: boolean
  data: ApiProviderItem[]
}

function mapProviderToWorker(item: ApiProviderItem): Worker {
  const provider = item.provider

  return {
    id: provider.id,
    userId: provider.id,
    firstName: provider.first_name,
    lastName: provider.last_name,
    description: provider.description ?? '',
    phone: provider.phone ?? '',
    whatsapp: provider.phone ?? '',
    department: provider.department ?? provider.city ?? '',
    zones: [],
    coverage: '' as CoverageType,
    categories: item.categories.map((category) => category.id),
    categoryNames: item.categories.map((category) => category.name),
    photoUrl: provider.profile_image_url ?? '',
    workPhotoUrls: [],
    ratingAverage: 0,
    reviewCount: 0,
    premium: false,
    experienceYears: null,
    schedule: '',
    availableDays: [],
    active: true,
  }
}

async function fetchProviders(): Promise<Worker[]> {
  const response = await apiFetch<ProvidersResponse>('/providers')

  if (!response.success) {
    throw new Error('No se pudieron obtener los prestadores.')
  }

  return response.data.map(mapProviderToWorker)
}

export const workerService = {
  async getAll(): Promise<Worker[]> {
    return fetchProviders()
  },

  async getById(id: string): Promise<Worker | null> {
    const providers = await fetchProviders()
    return providers.find((worker) => worker.id === id) ?? null
  },

  async search(
    filters: WorkerSearchFilters,
  ): Promise<Worker[]> {
    const normalizedQuery = normalizeText(filters.query ?? '')
    const normalizedZone = normalizeText(filters.zone ?? '')

    const workers = await fetchProviders()

    return workers.filter((worker) => {

      const searchableText = normalizeText(
        [
          worker.firstName,
          worker.lastName,
          worker.description,
          ...(worker.categoryNames ?? []),
        ].join(' '),
      )

      const matchesQuery =
        normalizedQuery === '' ||
        searchableText.includes(normalizedQuery)

      const matchesCategory =
        !filters.categoryId ||
        worker.categories.includes(filters.categoryId)

      // La API todavía no informa zonas. No excluimos prestadores
      // por un filtro de zona que no podemos verificar.
      const matchesZone =
        normalizedZone === '' || worker.zones.length === 0 ||
        worker.zones.some(
          (zone) => normalizeText(zone) === normalizedZone,
        )

      return matchesQuery && matchesCategory && matchesZone
    })
  },

  async updateMock(
    id: string,
    data: UpdateMockWorkerData,
  ): Promise<Worker | null> {
    const worker = mockWorkers.find((item) => item.id === id)

    if (!worker) {
      return null
    }

    Object.assign(worker, data)

    return worker
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

    return worker
  },
}