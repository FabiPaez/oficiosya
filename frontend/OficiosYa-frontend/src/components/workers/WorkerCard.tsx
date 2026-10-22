
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
    <Card
      className="worker-preview-card"
    >
      <div className="worker-preview-photo">
        <span>
          {worker.firstName.charAt(0)}
          {worker.lastName.charAt(0)}
        </span>
      </div>

      <div className="worker-preview-content">
        <div className="worker-preview-badges">
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

        <p>
          {(worker.categoryNames ?? worker.categories)
            .join(' · ')}
        </p>

        <WorkerRating
          rating={worker.ratingAverage}
          reviewCount={worker.reviewCount}
        />

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