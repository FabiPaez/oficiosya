import { useEffect, useState } from 'react'
import { reviewService } from '../services/reviewService'
import { workerService } from '../services/workerService'
import { useAuth } from '../hooks/useAuth'
import type { Review } from '../types/review'

function ReceivedReviewsPage() {
  const { user } = useAuth()

  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [workerExists, setWorkerExists] = useState<boolean | null>(
    null,
  )

  useEffect(() => {
    let cancelled = false

    async function loadReviews() {
      if (!user) {
        setWorkerExists(false)
        setLoading(false)
        return
      }

      try {
        const workers = await workerService.getAll()

        const worker = workers.find(
          (item) => item.userId === user.id,
        )

        if (cancelled) return

        setWorkerExists(Boolean(worker))

        if (!worker) {
          setReviews([])
          return
        }

        const workerReviews =
          await reviewService.getByWorkerId(worker.id)

        if (!cancelled) {
          setReviews(workerReviews)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadReviews()

    return () => {
      cancelled = true
    }
  }, [user])

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
        (total, review) => total + review.rating,
        0,
      ) / reviews.length
      : 0

  return (
    <main className="page-container">
      <section className="profile-page">
        <header className="profile-page__header">
          <h1>Calificaciones recibidas</h1>
          <p>
            Consultá las puntuaciones y opiniones que otros
            clientes dejaron sobre tus servicios.
          </p>
        </header>

        {loading ? (
          <section className="profile-card">
            <p>Cargando calificaciones...</p>
          </section>
        ) : workerExists === false ? (
          <section className="profile-card">
            <h2>Perfil de trabajador no encontrado</h2>
            <p>
              No encontramos un perfil de trabajador asociado
              a tu cuenta.
            </p>
          </section>
        ) : reviews.length === 0 ? (
          <section className="profile-card">
            <h2>Todavía no tenés calificaciones</h2>
            <p>
              Cuando los clientes califiquen tus servicios,
              sus opiniones aparecerán acá.
            </p>
          </section>
        ) : (
          <>
            <section className="profile-card">
              <h2>Resumen de calificaciones</h2>
              <p>
                Promedio: {averageRating.toFixed(1)} / 5
              </p>
              <p>
                {reviews.length}{' '}
                {reviews.length === 1
                  ? 'calificación recibida'
                  : 'calificaciones recibidas'}
              </p>
            </section>

            <section className="profile-card">
              <h2>Opiniones de los clientes</h2>

              <div className="reviews-list">
                {reviews.map((review) => (
                  <article
                    className="review-item"
                    key={review.id}
                  >
                    <header>
                      <h3>{review.clientName}</h3>
                      <p>
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                        {' '}
                        ({review.rating}/5)
                      </p>
                      <time
                        dateTime={review.createdAt}
                      >
                        {new Date(
                          review.createdAt,
                        ).toLocaleDateString('es-AR')}
                      </time>
                    </header>

                    <p>
                      {review.comment?.trim() ||
                        'El cliente no dejó un comentario.'}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  )
}

export default ReceivedReviewsPage