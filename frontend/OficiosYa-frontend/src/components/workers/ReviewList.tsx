
import type { Review } from '../../types/review'

interface ReviewListProps {
  reviews: Review[]
}

function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="state state-empty">
        Este profesional todavía no tiene reseñas.
      </div>
    )
  }

  return (
    <div className="worker-profile-reviews">
      {reviews.map((review) => (
        <article
          key={review.id}
          className="worker-profile-review"
        >
          <div className="worker-profile-review-header">
            <div>
              <strong>{review.clientName}</strong>

              <span className="worker-profile-review-date">
                {new Date(review.createdAt).toLocaleDateString(
                  'es-AR',
                )}
              </span>
            </div>

            <div
              className="worker-rating"
              aria-label={`Calificación: ${review.rating} de 5`}
            >
              <span aria-hidden="true">★</span>{' '}
              {review.rating.toFixed(1)}
              <span>/5</span>
            </div>
          </div>

          {review.comment && (
            <p className="worker-profile-review-comment">
              {review.comment}
            </p>
          )}
        </article>
      ))}
    </div>
  )
}

export default ReviewList