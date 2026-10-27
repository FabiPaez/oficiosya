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
    <Card className="worker-preview-card">
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

        <p className="worker-card-category">
          {categoriesList.join(' · ')}
        </p>

        <p className="worker-card-description">
          {worker.description}
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
  )
}

export default WorkerCard
