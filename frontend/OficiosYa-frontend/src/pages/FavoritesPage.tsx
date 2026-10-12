import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import WorkerCard from '../components/workers/WorkerCard'
import { useAuth } from '../hooks/useAuth'
import { favoriteService } from '../services/favoriteService'
import { workerService } from '../services/workerService'
import type { Worker } from '../types/worker'

function FavoritesPage() {
  const { user } = useAuth()

  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadFavorites() {
      if (!user) {
        setWorkers([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(false)

      try {
        const favorites =
          await favoriteService.getByClientId(user.id)

        const favoriteWorkers = await Promise.all(
          favorites.map((favorite) =>
            workerService.getById(favorite.workerId),
          ),
        )

        if (!cancelled) {
          setWorkers(
            favoriteWorkers.filter(
              (worker): worker is Worker => worker !== null,
            ),
          )
        }
      } catch {
        if (!cancelled) {
          setError(true)
          setWorkers([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadFavorites()

    return () => {
      cancelled = true
    }
  }, [user])


  async function handleRemoveFavorite(workerId: string) {
    if (!user) {
      return
    }

    setError(false)

    try {
      await favoriteService.remove(user.id, workerId)

      setWorkers((currentWorkers) =>
        currentWorkers.filter(
          (worker) => worker.id !== workerId,
        ),
      )
    } catch {
      setError(true)
    }
  }

  return (
    <main className="page-section">
      <div className="container">
        <header className="page-heading">
          <span className="section-eyebrow">
            Tus profesionales guardados
          </span>

          <h1>Mis favoritos</h1>

          <p>
            Encontrá fácilmente a los trabajadores que
            guardaste para consultar sus perfiles.
          </p>
        </header>

        {loading && (
          <div className="state state-loading" role="status">
            Cargando tus favoritos...
          </div>
        )}

        {error && (
          <div className="state state-error" role="alert">
            No pudimos actualizar tus favoritos.
            Intentá nuevamente.
          </div>
        )}

        {!loading && !error && workers.length === 0 && (
          <div className="state state-empty">
            <h2>Todavía no tenés favoritos</h2>

            <p>
              Cuando guardes un trabajador, aparecerá
              en esta sección.
            </p>

            <Link className="button button-primary" to="/buscar">
              Buscar trabajadores
            </Link>
          </div>
        )}

        {!loading && workers.length > 0 && (
          <section
            className="worker-results-grid"
            aria-label="Trabajadores favoritos"
          >
            {workers.map((worker) => (
              <div className="favorite-worker" key={worker.id}>
                <WorkerCard worker={worker} />

                <button
                  className="button button-outline"
                  type="button"
                  onClick={() =>
                    void handleRemoveFavorite(worker.id)
                  }
                >
                  Quitar de favoritos
                </button>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}

export default FavoritesPage