import type { Category } from '../../types/category'
import type { WorkerSearchFilters } from '../../types/search'

interface ActiveFiltersProps {
  filters: WorkerSearchFilters
  categories: Category[]
  onChange: (filters: WorkerSearchFilters) => void
}

function ActiveFilters({
  filters,
  categories,
  onChange,
}: ActiveFiltersProps) {
  const activeFilters: {
    key: string
    label: string
    onRemove: () => void
  }[] = []

  if (filters.query?.trim()) {
    activeFilters.push({
      key: 'query',
      label: `Búsqueda: ${filters.query}`,
      onRemove: () =>
        onChange({
          ...filters,
          query: '',
        }),
    })
  }

  if (filters.categoryId) {
    const category = categories.find(
      (item) => item.id === filters.categoryId,
    )

    if (category) {
      activeFilters.push({
        key: 'category',
        label: `Categoría: ${category.name}`,
        onRemove: () =>
          onChange({
            ...filters,
            categoryId: undefined,
          }),
      })
    }
  }

  if (filters.zone) {
    activeFilters.push({
      key: 'zone',
      label: `Zona: ${filters.zone}`,
      onRemove: () =>
        onChange({
          ...filters,
          zone: undefined,
        }),
    })
  }

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <div
      className="active-filters"
      aria-label="Filtros activos"
    >
      <span className="active-filters-label">
        Filtros activos:
      </span>

      <div className="active-filters-list">
        {activeFilters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            className="active-filter"
            onClick={filter.onRemove}
            aria-label={`Quitar ${filter.label}`}
          >
            {filter.label}
            <span aria-hidden="true">×</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ActiveFilters