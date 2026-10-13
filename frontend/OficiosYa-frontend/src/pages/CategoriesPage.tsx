import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryService } from '../services/categoryService'
import type { Category } from '../types/category'

function CategoriesPage() {
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

return ( <main> <h1>Categorías de oficios</h1>

```
  {loading && <p>Cargando categorías...</p>}

  {error && (
    <p role="alert">
      No pudimos cargar las categorías: {error}
    </p>
  )}

  {!loading && !error && categories.length === 0 && (
    <p>Por el momento no hay categorías disponibles.</p>
  )}

  {!loading && !error && categories.length > 0 && (
    <ul>
      {categories.map((category) => (
        <li key={category.id}>
          <Link to={`/categorias/${category.id}`}>
            <strong>{category.name}</strong>
            {category.description && (
              <p>{category.description}</p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )}
</main>


)
}

export default CategoriesPage
