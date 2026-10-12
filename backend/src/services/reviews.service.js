
import {
  createReviewRecord,
  findReviewById,
  findReviewByRequestId,
  findReviewsByProviderId,
} from '../repositories/reviews.repository.js';

import { findServiceRequestById } from '../repositories/service-requests.repository.js';
import { findProviderById } from '../repositories/providers.repository.js';
import { AppError } from '../utils/AppError.js';

export async function createReview(
  userId,
  { requestId, rating, comment },
  supabaseClient,
) {
  const request = supabaseClient
    ? await findServiceRequestById(requestId, supabaseClient)
    : await findServiceRequestById(requestId);

  if (!request) {
    throw new AppError('Solicitud de servicio no encontrada', 404);
  }

  // Solo el cliente de la solicitud puede reseñar.
  if (request.client_id !== userId) {
    throw new AppError(
      'Solo el cliente que solicitó el servicio puede calificarlo',
      403,
    );
  }

  // Solo se pueden calificar solicitudes completadas.
  if (request.status !== 'COMPLETED') {
    throw new AppError(
      'Solo se pueden calificar solicitudes en estado COMPLETED',
      409,
    );
  }

  // Una única reseña por solicitud.
  const existingReview = supabaseClient
    ? await findReviewByRequestId(requestId, supabaseClient)
    : await findReviewByRequestId(requestId);

  if (existingReview) {
    throw new AppError(
      'Esta solicitud de servicio ya ha sido calificada',
      409,
    );
  }

  const reviewData = {
    requestId,
    reviewerId: userId,
    reviewedId: request.provider_id,
    rating,
    comment,
  };

  return supabaseClient
    ? createReviewRecord(reviewData, supabaseClient)
    : createReviewRecord(reviewData);
}

export async function getReviewById(id, supabaseClient) {
  const review = supabaseClient
    ? await findReviewById(id, supabaseClient)
    : await findReviewById(id);

  if (!review) {
    throw new AppError('Reseña no encontrada', 404);
  }

  return review;
}

export async function getProviderReviews(providerId, supabaseClient) {
  const provider = supabaseClient
    ? await findProviderById(providerId, supabaseClient)
    : await findProviderById(providerId);

  if (!provider) {
    throw new AppError('Prestador no encontrado', 404);
  }

  const reviews = supabaseClient
    ? await findReviewsByProviderId(providerId, supabaseClient)
    : await findReviewsByProviderId(providerId);

  const totalReviews = reviews.length;

  const averageRating = totalReviews > 0
    ? Number(
        (
          reviews.reduce((acc, review) => acc + review.rating, 0) /
          totalReviews
        ).toFixed(1),
      )
    : 0;

  return {
    averageRating,
    totalReviews,
    reviews,
  };
}