import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categoryService } from '../services/categoryService'
import { workerService } from '../services/workerService'
import type { Category } from '../types/category'
import type { WorkerSearchFilters } from '../types/search'
import type { Worker } from '../types/worker'
import { rankWorkers } from '../utils/workerRanking'
import ActiveFilters from '../components/search/ActiveFilters'
import SearchFilters from '../components/search/SearchFilters'
import WorkerCard from '../components/workers/WorkerCard'
import { useAuth } from '../hooks/useAuth'

const INITIAL_FILTERS: WorkerSearchFilters = {
  query: '',
  categoryId: undefined,
  zone: undefined,
}

const VALID_ZONES = [
  'Jáchal Centro',
  'Zonas rurales',
]

function SearchPage() {
  const [searchParams, setSearchParams] =
    useSearchParams()
  const { user } = useAuth()

  const [filters, setFilters] =
    useState<WorkerSearchFilters>(INITIAL_FILTERS)

  const [categories, setCategories] = useState<Category[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const initializedFromUrl = useRef(false)

  useEffect(() => {
    async function initializeSearch() {
      try {
        const result = await categoryService.getAll()

        setCategories(result)

        const query = searchParams.get('q') ?? ''
        const categoryId =
          searchParams.get('categoria') ?? undefined
        const zone =
          searchParams.get('zona') ?? undefined

        const validCategoryId =
          categoryId &&
            result.some(
              (category) => category.id === categoryId,
            )
            ? categoryId
            : undefined

        const validZone =
          zone && VALID_ZONES.includes(zone)
            ? zone
            : undefined

        setFilters({
          query,
          categoryId: validCategoryId,
          zone: validZone,
        })

        initializedFromUrl.current = true
      } catch {
        setError(true)
      }
    }

    void initializeSearch()
  }, [searchParams])

  useEffect(() => {
    if (!initializedFromUrl.current) {
      return
    }

    const params = new URLSearchParams()

    const query = filters.query?.trim()

    if (query) {
      params.set('q', query)
    }

    if (filters.categoryId) {
      params.set('categoria', filters.categoryId)
    }

    if (filters.zone) {
      params.set('zona', filters.zone)
    }

    const currentParams = searchParams.toString()
    const nextParams = params.toString()

    if (currentParams !== nextParams) {
      setSearchParams(params)
    }
  }, [
    filters,
    searchParams,
    setSearchParams,
  ])

  useEffect(() => {
    async function searchWorkers() {
      setLoading(true)
      setError(false)

      try {
        const result = await workerService.search(filters)
        const rankedWorkers = rankWorkers(result, filters)

        const visibleWorkers = user
          ? rankedWorkers.filter(
            (worker) => worker.userId !== user.id,
          )
          : rankedWorkers

        setWorkers(visibleWorkers)
      } catch {
        setError(true)
        setWorkers([])
      } finally {
        setLoading(false)
      }
    }

    void searchWorkers()
  }, [filters, user])

  function handleFiltersChange(
    nextFilters: WorkerSearchFilters,
  ) {
    setFilters(nextFilters)
  }

  function handleClearFilters() {
    setFilters(INITIAL_FILTERS)
  }

  return (
    <main className="page-section">
      <div className="container">
        <div className="page-heading">
          <span className="section-eyebrow">
            Encontrá profesionales
          </span>

          <h1>Buscar trabajadores</h1>

          <p>
            Buscá por servicio, categoría o zona y encontrá
            el profesional que necesitás.
          </p>
        </div>

        <SearchFilters
          filters={filters}
          categories={categories}
          onChange={handleFiltersChange}
          onClear={handleClearFilters}
        />

        <ActiveFilters
          filters={filters}
          categories={categories}
          onChange={handleFiltersChange}
        />

        <section
          className="search-results"
          aria-live="polite"
        >
          <div className="search-results-heading">
            <h2>Resultados</h2>

            {!loading && !error && (
              <span>
                {workers.length}{' '}
                {workers.length === 1
                  ? 'trabajador encontrado'
                  : 'trabajadores encontrados'}
              </span>
            )}
          </div>

          {loading && (
            <div className="state state-loading">
              Buscando trabajadores...
            </div>
          )}

          {error && (
            <div className="state state-error">
              No pudimos realizar la búsqueda.
              Intentá nuevamente.
            </div>
          )}

          {!loading && !error && workers.length === 0 && (
            <div className="state state-empty">
              No encontramos trabajadores con esos
              criterios.
            </div>
          )}

          {!loading && !error && workers.length > 0 && (
            <div className="worker-results-grid">
              {workers.map((worker) => (
                <WorkerCard
                  key={worker.id}
                  worker={worker}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default SearchPage