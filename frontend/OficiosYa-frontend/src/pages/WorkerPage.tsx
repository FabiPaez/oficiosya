import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import { useAuth } from '../hooks/useAuth'
import { favoriteService } from '../services/favoriteService'
import { reportService } from '../services/reportService'
import { workerService } from '../services/workerService'
import type { Worker } from '../types/worker'

function WorkerPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isAuthenticated } = useAuth()

  const [worker, setWorker] = useState<Worker | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [reporting, setReporting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadWorker() {
      if (!id) {
        setWorker(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(false)

      try {
        const result = await workerService.getById(id)

        if (cancelled) return
        setWorker(result)
      } catch {
        if (!cancelled) {
          setError(true)
          setWorker(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadWorker()

    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    async function loadFavoriteState() {
      if (!user || !worker) {
        setIsFavorite(false)
        return
      }

      const favorite =
        await favoriteService.isFavorite(
          user.id,
          worker.id,
        )

      setIsFavorite(favorite)
    }

    void loadFavoriteState()
  }, [user, worker])

  async function handleFavorite() {
    if (!user || !worker || favoriteLoading) {
      return
    }

    setFavoriteLoading(true)

    try {
      if (isFavorite) {
        await favoriteService.remove(user.id, worker.id)
        setIsFavorite(false)
      } else {
        await favoriteService.add(user.id, worker.id)
        setIsFavorite(true)
      }
    } finally {
      setFavoriteLoading(false)
    }
  }

  async function handleReport() {
    if (!isAuthenticated || !user || !worker || reporting) {
      return
    }

    const confirmed = window.confirm(
      `¿Querés reportar el perfil de ${worker.firstName} ${worker.lastName}?`,
    )

    if (!confirmed) {
      return
    }

    setReporting(true)

    try {
      await reportService.create({
        reporterId: user.id,
        workerId: worker.id,
        reason: 'OTRO',
        description:
          'Reporte realizado desde el perfil del trabajador.',
      })

      window.alert(
        'El reporte fue registrado correctamente.',
      )
    } finally {
      setReporting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-section">
        <div className="container">
          <div className="state state-loading">
            Cargando perfil...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-section">
        <div className="container">
          <div className="state state-error">
            No pudimos cargar el perfil del trabajador.
          </div>

          <Link
            to="/buscar"
            className="button button-outline"
          >
            Volver a buscar
          </Link>
        </div>
      </div>
    )
  }

  if (!worker) {
    return (
      <div className="page-section">
        <div className="container">
          <div className="state state-empty">
            No encontramos el trabajador que buscás.
          </div>

          <Link
            to="/buscar"
            className="button button-outline"
          >
            Volver a buscar
          </Link>
        </div>
      </div>
    )
  }

  const categoriesList = worker.categoryNames ?? worker.categories

  return (
    <div className="page-section">
      <div className="container">
        <Link
          to="/buscar"
          className="worker-profile-back"
        >
          ← Volver a buscar
        </Link>

        <section className="worker-profile-header">
          <div className="worker-profile-photo">
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

          <div className="worker-profile-main">
            <div className="worker-profile-badges">
              {worker.premium && (
                <Badge variant="premium">
                  PREMIUM
                </Badge>
              )}
            </div>

            <h1>
              {worker.firstName} {worker.lastName}
            </h1>

            <p className="worker-profile-category">
              {categoriesList.join(' · ')}
            </p>

            <p className="worker-profile-description">
              {worker.description}
            </p>
          </div>

          <div className="worker-profile-contact">
            <a
              href={`tel:${worker.phone}`}
              className="button button-primary"
            >
              Llamar
            </a>

            {worker.whatsapp.trim() ? (
              <a
                href={`https://wa.me/${worker.whatsapp.replace(/\D/g, '')}`}
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
                aria-label="WhatsApp no disponible: el trabajador no informó un número"
              >
                WhatsApp (no disponible)
              </button>
            )}
          </div>

          <div className="worker-profile-actions">
            {isAuthenticated && (
              <>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => void handleFavorite()}
                  disabled={favoriteLoading}
                >
                  {favoriteLoading
                    ? 'Guardando...'
                    : isFavorite
                      ? '★ Quitar de favoritos'
                      : '☆ Agregar a favoritos'}
                </button>

                <button
                  type="button"
                  className="worker-profile-report"
                  onClick={() => void handleReport()}
                  disabled={reporting}
                >
                  {reporting
                    ? 'Enviando...'
                    : '⚑ Reportar trabajador'}
                </button>
              </>
            )}
          </div>
        </section>

        <section className="worker-profile-section">
          <h2>Información del profesional</h2>

          <div className="worker-profile-info">
            <div>
              <strong>Cobertura</strong>

              <span>{worker.coverage || 'Sin informar'}</span>

              {worker.zones.length > 0 && (
                <small>
                  {worker.zones.join(' · ')}
                </small>
              )}
            </div>

            <div>
              <strong>Departamento</strong>
              <span>{worker.department || 'Sin informar'}</span>
            </div>

            <div>
              <strong>Experiencia</strong>
              <span>
                {worker.experienceYears === '+40'
                  ? '+40 años'
                  : worker.experienceYears !== null
                    ? `${worker.experienceYears} ${worker.experienceYears === 1 ? 'año' : 'años'}`
                    : 'Sin informar'}
              </span>
            </div>

            <div>
              <strong>Horarios</strong>
              <span>{worker.schedule || 'Sin informar'}</span>
            </div>
          </div>
        </section>

        <section className="worker-profile-section">
          <h2>Días de atención</h2>

          <div className="worker-profile-days">
            {worker.availableDays.length > 0 ? (
              worker.availableDays.map((day) => (
                <span key={day}>{day}</span>
              ))
            ) : (
              <span>A coordinar</span>
            )}
          </div>
        </section>

        <section className="worker-profile-section">
          <h2>Trabajos realizados</h2>

          {worker.workPhotoUrls.length === 0 ? (
            <div className="state state-empty">
              Este profesional todavía no cargó fotos de
              trabajos realizados.
            </div>
          ) : (
            <div className="worker-profile-gallery">
              {worker.workPhotoUrls.map((photoUrl, index) => (
                <figure
                  key={photoUrl}
                  className="worker-profile-gallery-item"
                >
                  <img
                    src={photoUrl}
                    alt={`Trabajo realizado por ${worker.firstName} ${worker.lastName}, imagen ${index + 1}`}
                    loading="lazy"
                  />
                </figure>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default WorkerPage
