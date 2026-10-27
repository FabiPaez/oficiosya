import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { categoryService } from '../services/categoryService'
import { workerService } from '../services/workerService'
import type { Category } from '../types/category'
import type { Worker } from '../types/worker'
import WorkerCard from '../components/workers/WorkerCard'

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
    <div className="page-section">
      <div className="container">
        <p>
          <Link to="/categorias" className="button button-outline">← Volver a categorías</Link>
        </p>

        {loading && <div className="state state-loading">Cargando categoría y prestadores...</div>}

        {error && <div className="state state-error" role="alert">{error}</div>}

        {!loading && !error && category && (
          <section className="home-section" style={{ padding: '0' }}>
            <div className="section-heading">
              <div>
                <span className="section-eyebrow">Profesionales</span>
                <h1>{category.name}</h1>
                {category.description && <p>{category.description}</p>}
              </div>
            </div>

            <h2>Trabajadores de esta categoría</h2>

            {workers.length === 0 ? (
              <div className="state state-empty">
                Por el momento no hay trabajadores registrados en esta categoría.
              </div>
            ) : (
              <div className="worker-preview-grid">
                {workers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

export default CategoryPage
