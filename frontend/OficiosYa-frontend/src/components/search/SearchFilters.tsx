import type { Category } from '../../types/category'
import type { WorkerSearchFilters } from '../../types/search'

interface SearchFiltersProps {
  filters: WorkerSearchFilters
  categories: Category[]
  onChange: (filters: WorkerSearchFilters) => void
  onClear: () => void
}

function SearchFilters({
  filters,
  categories,
  onChange,
  onClear,
}: SearchFiltersProps) {
  function handleQueryChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    onChange({
      ...filters,
      query: event.target.value,
    })
  }

  function handleCategoryChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    onChange({
      ...filters,
      categoryId: event.target.value || undefined,
    })
  }

  function handleZoneChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    onChange({
      ...filters,
      zone: event.target.value || undefined,
    })
  }

  return (
    <div className="search-filters">
      <div className="form-group search-filter-query">
        <label
          htmlFor="search-query"
          className="form-label"
        >
          ¿Qué servicio necesitás?
        </label>

        <input
          id="search-query"
          type="search"
          className="form-input"
          placeholder="Ej.: electricista, plomero..."
          value={filters.query ?? ''}
          onChange={handleQueryChange}
        />
      </div>

      <div className="form-group">
        <label
          htmlFor="search-category"
          className="form-label"
        >
          Categoría
        </label>

        <select
          id="search-category"
          className="form-select"
          value={filters.categoryId ?? ''}
          onChange={handleCategoryChange}
        >
          <option value="">Todas las categorías</option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label
          htmlFor="search-zone"
          className="form-label"
        >
          Zona
        </label>

        <select
          id="search-zone"
          className="form-select"
          value={filters.zone ?? ''}
          onChange={handleZoneChange}
        >
          <option value="">Todas las zonas</option>
          <option value="Jáchal Centro">
            Jáchal Centro
          </option>
          <option value="Zonas rurales">
            Zonas rurales
          </option>
          <option value="Otras">
            Otras
          </option>
        </select>
      </div>

      <button
        type="button"
        className="button button-secondary"
        onClick={onClear}
      >
        Limpiar filtros
      </button>
    </div>
  )
}

export default SearchFilters