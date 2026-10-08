import { Link } from 'react-router-dom'
import type { Worker } from '../../types/worker'
import Badge from '../ui/Badge'
import Card from '../ui/Card'
import WorkerRating from './WorkerRating'

interface WorkerCardProps {
  worker: Worker
}

function WorkerCard({ worker }: WorkerCardProps) {
  return (
    <Card className="worker-card">
      <div className="worker-card-photo">
        <span>
          {worker.firstName.charAt(0)}
          {worker.lastName.charAt(0)}
        </span>
      </div>

      <div className="worker-card-content">
        <div className="worker-card-badges">
          {worker.premium && (
            <Badge variant="premium">
              PREMIUM
            </Badge>
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

        <p className="worker-card-category">
          {worker.categories.join(' · ')}
        </p>

        <WorkerRating
          rating={worker.ratingAverage}
          reviewCount={worker.reviewCount}
        />

        <p className="worker-card-description">
          {worker.description}
        </p>

        <Link
          to={`/trabajador/${worker.id}`}
          className="button button-outline"
        >
          Ver perfil
        </Link>
      </div>
    </Card>
  )
}

export default WorkerCard