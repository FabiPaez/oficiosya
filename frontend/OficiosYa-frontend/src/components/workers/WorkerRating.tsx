interface WorkerRatingProps {
  rating: number
  reviewCount: number
}

function WorkerRating({
  rating,
  reviewCount,
}: WorkerRatingProps) {
  if (reviewCount < 3) {
    return (
      <div className="worker-rating">
        <span>{reviewCount} reseñas</span>
      </div>
    )
  }

  return (
    <div
      className="worker-rating"
      aria-label={`Valoración ${rating.toFixed(1)} de 5, ${reviewCount} reseñas`}
    >
      <span aria-hidden="true">★</span>{' '}
      {rating.toFixed(1)}
      <span>
        ({reviewCount} reseñas)
      </span>
    </div>
  )
}

export default WorkerRating