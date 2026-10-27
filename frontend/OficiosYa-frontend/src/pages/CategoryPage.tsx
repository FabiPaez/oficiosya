import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { categoryService } from '../services/categoryService'
import { workerService } from '../services/workerService'
import type { Category } from '../types/category'
import type { Worker } from '../types/worker'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import WorkerRating from '../components/workers/WorkerRating'

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
        <section className="home-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="section-eyebrow">Profesionales</span>
                <h1>{category.name}</h1>
                {category.description && <p>{category.description}</p>}
              </div>
            </div>

            <h2>Trabajadores de esta categoría</h2>

            {workers.length === 0 ? (
              <p>
                Por el momento no hay trabajadores registrados en esta
                categoría.
              </p>
            ) : (
              <div className="worker-preview-grid">
                {workers.map((worker) => (
                  <Card
                    key={worker.id}
                    className="worker-preview-card"
                  >
                    <div className="worker-preview-photo">
                      {worker.photoUrl ? (
                        <img
                          src={worker.photoUrl}
                          alt={`${worker.firstName} ${worker.lastName}`}
                        />
                      ) : (
                        <span>
                          {worker.firstName.charAt(0)}
                          {worker.lastName.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="worker-preview-content">
                      <div className="worker-preview-badges">
                        {worker.premium && (
                          <Badge variant="premium">PREMIUM</Badge>
                        )}

                        {worker.ratingAverage >= 4.8 &&
                          worker.reviewCount >= 3 && (
                            <Badge variant="excellent">
                              EXCELENTE
                            </Badge>
                          )}
                      </div>

                      <h3>
                        {worker.firstName} {worker.lastName}
                      </h3>

                      <p>
                        {(worker.categoryNames ?? worker.categories).join(
                          ' · ',
                        )}
                      </p>

                      {worker.description && <p>{worker.description}</p>}

                      {worker.department && <p>{worker.department}</p>}

                      {worker.coverage && (
                        <p>Zonas: {worker.coverage}</p>
                      )}

                      <WorkerRating
                        rating={worker.ratingAverage}
                        reviewCount={worker.reviewCount}
                      />

                      <div className="worker-card-actions">
                        <Link
                          to={`/trabajador/${worker.id}`}
                          className="button button-outline"
                        >
                          Ver perfil
                        </Link>

                        {worker.phone.trim() && (
                          <a
                            href={`tel:${worker.phone}`}
                            className="button button-primary"
                          >
                            Llamar
                          </a>
                        )}

                        {worker.whatsapp.trim() ? (
                          <a
                            href={`https://wa.me/${worker.whatsapp.replace(
                              /\D/g,
                              '',
                            )}`}
                            className="button button-secondary"
                            target="_blank"
                            rel="noreferrer"
                          >
                            WhatsApp
                          </a>
                        ) : (
                          <button
                            type="button"
                            className="button button-secondary"
                            disabled
                          >
                            WhatsApp no disponible
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  )
}

export default CategoryPage