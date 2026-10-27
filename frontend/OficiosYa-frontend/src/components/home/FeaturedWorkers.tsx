import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { workerService } from '../../services/workerService'
import type { Worker } from '../../types/worker'
import { rankWorkers } from '../../utils/workerRanking'
import Badge from '../ui/Badge'
import Card from '../ui/Card'

function FeaturedWorkers() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function loadWorkers() {
      try {
        const result = await workerService.getAll()

        const featured = rankWorkers(result, {}).slice(0, 4)

        setWorkers(featured)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    void loadWorkers()
  }, [])

  if (loading) {
    return (
      <section className="home-section">
        <div className="container">
          <div className="state state-loading">
            Cargando trabajadores...
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="home-section">
        <div className="container">
          <div className="state state-error">
            No pudimos cargar los trabajadores.
          </div>
        </div>
      </section>
    )
  }

  if (workers.length === 0) {
    return (
      <section className="home-section">
        <div className="container">
          <div className="state state-empty">
            No hay trabajadores disponibles.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="home-section">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              Profesionales
            </span>

            <h2>Trabajadores destacados</h2>
          </div>

          <Link to="/buscar" className="section-link">
            Ver todos
          </Link>
        </div>

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
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
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
                    <Badge variant="premium">
                      PREMIUM
                    </Badge>
                  )}
                </div>

                <h3>
                  {worker.firstName} {worker.lastName}
                </h3>

                <p>
                  {(worker.categoryNames ?? worker.categories)
                    .map((categoryId) => categoryId)
                    .join(' · ')}
                </p>

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
      </div>
    </section>
  )
}

export default FeaturedWorkers
