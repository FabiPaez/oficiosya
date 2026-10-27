import { Link } from 'react-router-dom'
import type { Worker } from '../../types/worker'
import Badge from '../ui/Badge'
import Card from '../ui/Card'

interface WorkerCardProps {
  worker: Worker
}

function WorkerCard({ worker }: WorkerCardProps) {
  const categoriesList = worker.categoryNames ?? worker.categories

  return (
    <Card className="worker-card">
      <div className="worker-card-photo">
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

      <div className="worker-card-content">
        <div className="worker-card-badges">
          {worker.premium && (
            <Badge variant="premium">
              PREMIUM
            </Badge>
          )}
        </div>

        <h3>
          {worker.firstName} {worker.lastName}
        </h3>

        <p className="worker-card-category">
          {categoriesList.join(' · ')}
        </p>

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
