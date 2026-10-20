import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { categoryService } from '../services/categoryService'
import { workerService } from '../services/workerService'
import type { Category } from '../types/category'
import type { Worker } from '../types/worker'

function CategoryPage() {
  const { id } = useParams<{ id: string }>()

  const [category, setCategory] = useState<Category | null>(null)
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadCategoryAndWorkers() {
      if (!id) {
        setError('No se indicó una categoría válida.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const [categoryResult, allWorkers] = await Promise.all([
          categoryService.getById(id),
          workerService.getAll(),
        ])

        if (!active) return

        if (!categoryResult) {
          setCategory(null)
          setWorkers([])
          setError('La categoría no existe o no está disponible.')
          return
        }

        setCategory(categoryResult)

        const matchingWorkers = allWorkers.filter((worker) =>
          worker.categories.some(
            (categoryId) => String(categoryId) === String(id),
          ),
        )

        setWorkers(matchingWorkers)
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar la categoría y sus prestadores.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadCategoryAndWorkers()

    return () => {
      active = false
    }
  }, [id])

  return (
    <main>
      <p>
        <Link to="/categorias">← Volver a categorías</Link>
      </p>

      {loading && <p>Cargando categoría y prestadores...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && category && (
        <>
          <h1>{category.name}</h1>

          {category.description && <p>{category.description}</p>}

          <section>
            <h2>Trabajadores de esta categoría</h2>

            {workers.length === 0 ? (
              <p>
                Por el momento no hay trabajadores registrados en esta categoría.
              </p>
            ) : (
              <ul>
                {workers.map((worker) => (
                  <li key={worker.id}>
                    <h3>
                      {worker.firstName} {worker.lastName}
                    </h3>

                    {worker.description && <p>{worker.description}</p>}

                    {worker.department && <p>{worker.department}</p>}

                    {worker.coverage && <p>Zonas: {worker.coverage}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  )
}

export default CategoryPage