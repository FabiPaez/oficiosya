import { apiFetch } from './api'
import { mockWorkers } from '../data/mockWorkers'
import type { Worker, CoverageType } from '../types/worker'
import type { WorkerSearchFilters } from '../types/search'
import { normalizeText } from '../utils/normalizeText'
import { getZonesFromCoverage } from '../utils/coverageZones'

export type CreateMockWorkerData = Omit<
  Worker,
  'id' | 'premium' | 'active'
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
  coverage: string | null
  experience_years: string | null
  schedule: string | null
  available_days: string[] | null
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
  const coverage = (provider.coverage ?? '') as CoverageType

  return {
    id: provider.id,
    userId: provider.id,
    firstName: provider.first_name,
    lastName: provider.last_name,
    description: provider.description ?? '',
    phone: provider.phone ?? '',
    whatsapp: provider.phone ?? '',
    department: provider.department ?? provider.city ?? '',
    zones: getZonesFromCoverage(coverage),
    coverage,
    categories: item.categories.map((category) => category.id),
    categoryNames: item.categories.map((category) => category.name),
    photoUrl: provider.profile_image_url ?? '',
    workPhotoUrls: [],
    premium: false,
    experienceYears:
      provider.experience_years == null
        ? null
        : provider.experience_years === '+40'
          ? '+40'
          : Number(provider.experience_years),
    schedule: provider.schedule ?? '',
    availableDays: provider.available_days ?? [],
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

  async registerProvider(data: {
    description: string
    department: string
    categoryIds: string[]
    coverage: CoverageType
    experienceYears: string
    schedule: string
    availableDays: string[]
  }): Promise<void> {
    const categoryIds = data.categoryIds.map(Number)

    if (
      categoryIds.length === 0 ||
      categoryIds.some(
        (id) => !Number.isSafeInteger(id) || id <= 0,
      ) ||
      new Set(categoryIds).size !== categoryIds.length
    ) {
      throw new Error('Las categorías seleccionadas no son válidas.')
    }

    const response = await apiFetch<{ success: boolean }>(
      '/providers/register',
      {
        method: 'POST',
        body: JSON.stringify({
          description: data.description.trim(),
          city: data.department.trim(),
          department: data.department.trim(),
          category_ids: categoryIds,
          coverage: data.coverage,
          experience_years: data.experienceYears,
          schedule: data.schedule,
          available_days: data.availableDays,
        }),
      },
    )

    if (!response.success) {
      throw new Error('No se pudo registrar el perfil profesional.')
    }
  },


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
    const workers = await fetchProviders()
    const worker = workers.find(
      (item) => item.id === id || item.userId === id,
    )

    if (!worker) {
      return null
    }

    const response = await apiFetch<{
      success: boolean
      data: {
        id: string
        first_name: string
        last_name: string
        phone: string | null
        profile_image_url: string | null
        description: string | null
        city: string | null
        department: string | null
        coverage: string | null
        experience_years: string | null
        schedule: string | null
        available_days: string[] | null
        created_at?: string
      }
    }>('/providers/me', {
      method: 'PATCH',
      body: JSON.stringify({
        description: data.description,
        department: data.department,
        city: data.department,
        phone: data.phone,
        category_ids: data.categories.map(Number),
        coverage: data.coverage,
        experience_years:
          data.experienceYears == null
            ? null
            : String(data.experienceYears),
        schedule: data.schedule,
        available_days: data.availableDays,
      }),
    })

    if (!response.success) {
      throw new Error('No se pudo actualizar el perfil profesional.')
    }

    const refreshedWorkers = await fetchProviders()

    const refreshedWorker = refreshedWorkers.find(
      (item) => item.id === id || item.userId === id,
    )

    if (refreshedWorker) {
      return refreshedWorker
    }

    return {
      ...worker,
      description: response.data.description ?? '',
      phone: response.data.phone ?? '',
      whatsapp: response.data.phone ?? '',
      department:
        response.data.department ?? response.data.city ?? '',
      coverage: (response.data.coverage ?? '') as CoverageType,
      experienceYears:
        response.data.experience_years == null
          ? null
          : response.data.experience_years === '+40'
            ? '+40'
            : Number(response.data.experience_years),
      schedule: response.data.schedule ?? '',
      availableDays: response.data.available_days ?? [],
      categories: data.categories,
    }
  },

  async createMock(
    data: CreateMockWorkerData,
  ): Promise<Worker> {
    const worker: Worker = {
      ...data,
      id: `worker-${Date.now()}`,
      premium: false,
      active: true,
    }

    mockWorkers.push(worker)

    return worker
  },
}
