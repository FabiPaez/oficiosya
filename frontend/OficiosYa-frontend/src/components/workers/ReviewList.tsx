import WorkerRating from './WorkerRating'
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

            <WorkerRating
              rating={review.rating}
              reviewCount={3}
            />
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