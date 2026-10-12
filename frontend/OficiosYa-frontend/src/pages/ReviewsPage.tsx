import { useEffect, useState } from 'react'
import { mockWorkers } from '../data/mockWorkers'
import { reviewService } from '../services/reviewService'
import { useAuth } from '../hooks/useAuth'
import type { Review } from '../types/review'

function ReviewsPage() {
  const { user } = useAuth()

  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadReviews() {
      if (!user) {
        setReviews([])
        setLoading(false)
        return
      }

      try {
        const clientReviews =
          await reviewService.getByClientId(user.id)

        if (!cancelled) {
          setReviews(clientReviews)
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

  return (
    <main className="page-container">
      <section className="profile-page">
        <header className="profile-page__header">
          <h1>Mis calificaciones</h1>
          <p>
            Consultá las puntuaciones y opiniones que
            dejaste sobre los trabajadores.
          </p>
        </header>

        {loading ? (
          <section className="profile-card">
            <p>Cargando tus calificaciones...</p>
          </section>
        ) : reviews.length === 0 ? (
          <section className="profile-card">
            <h2>Todavía no dejaste calificaciones</h2>
            <p>
              Cuando califiques a un trabajador, tu
              opinión aparecerá acá.
            </p>
          </section>
        ) : (
          <>
            <section className="profile-card">
              <h2>Resumen</h2>
              <p>
                Dejaste {reviews.length}{' '}
                {reviews.length === 1
                  ? 'calificación'
                  : 'calificaciones'}.
              </p>
            </section>

            <section className="profile-card">
              <h2>Mis opiniones</h2>

              <div className="reviews-list">
                {reviews.map((review) => {
                  const worker = mockWorkers.find(
                    (item) => item.id === review.workerId,
                  )

                  return (
                    <article
                      className="review-item"
                      key={review.id}
                    >
                      <header>
                        <h3>
                          {worker
                            ? `${worker.firstName} ${worker.lastName}`
                            : 'Trabajador'}
                        </h3>

                        <p>
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                          {' '}
                          ({review.rating}/5)
                        </p>

                        <time dateTime={review.createdAt}>
                          {new Date(
                            review.createdAt,
                          ).toLocaleDateString('es-AR')}
                        </time>
                      </header>

                      <p>
                        {review.comment?.trim() ||
                          'No agregaste un comentario.'}
                      </p>
                    </article>
                  )
                })}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  )
}

export default ReviewsPage