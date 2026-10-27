import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryService } from '../../services/categoryService'
import type { Category } from '../../types/category'
//import Card from '../ui/Card'

function CategoryPreview() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadCategories() {
      try {
        const result = await categoryService.getAll()

        if (active) {
          setCategories(result)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudieron cargar las categorías.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadCategories()

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="categories-page">
      <div className="container">
        <header className="categories-header">
          <span className="section-eyebrow">Encontrá profesionales</span>
          <h1>Categorías de oficios</h1>
          <p>
            Explorá los distintos oficios y encontrá trabajadores
            disponibles para tus necesidades.
          </p>
        </header>

        {loading && (
          <p className="categories-message">
            Cargando categorías...
          </p>
        )}

        {error && (
          <p className="categories-message categories-error" role="alert">
            No pudimos cargar las categorías: {error}
          </p>
        )}

        {!loading && !error && categories.length === 0 && (
          <p className="categories-message">
            Por el momento no hay categorías disponibles.
          </p>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categorias/${category.id}`}
                className="category-card"
              >
                <div className="category-card-icon" aria-hidden="true">
                  {category.name.charAt(0).toUpperCase()}
                </div>

                <h2>{category.name}</h2>

                <p>
                  {category.description ||
                    'Consultá los trabajadores disponibles en esta categoría.'}
                </p>

                <span className="category-card-link">
                  Ver trabajadores
                  <span aria-hidden="true"> →</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default CategoryPreview