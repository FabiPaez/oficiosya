import {
    createReviewRecord,
    findReviewById,
    findReviewByRequestId,
    findReviewsByProviderId,
  } from '../repositories/reviews.repository.js';
  import { findServiceRequestById } from '../repositories/service-requests.repository.js';
  import { findProviderById } from '../repositories/providers.repository.js';
  import { AppError } from '../utils/AppError.js';
  
  export async function createReview(userId, { requestId, rating, comment }) {
    const request = await findServiceRequestById(requestId);
    if (!request) {
      throw new AppError('Solicitud de servicio no encontrada', 404);
    }
  
    // Regla: solo el cliente de la solicitud puede reseñar
    if (request.client_id !== userId) {
      throw new AppError('Solo el cliente que solicitó el servicio puede calificarlo', 403);
    }
  
    // Regla: solo solicitudes completadas
    if (request.status !== 'COMPLETED') {
      throw new AppError('Solo se pueden calificar solicitudes en estado COMPLETED', 409);
    }
  
    // Regla: única reseña por solicitud
    const existingReview = await findReviewByRequestId(requestId);
    if (existingReview) {
      throw new AppError('Esta solicitud de servicio ya ha sido calificada', 409);
    }
  
    return createReviewRecord({
      requestId,
      reviewerId: userId,
      reviewedId: request.provider_id,
      rating,
      comment,
    });
  }
  
  export async function getReviewById(id) {
    const review = await findReviewById(id);
    if (!review) {
      throw new AppError('Reseña no encontrada', 404);
    }
    return review;
  }
  
  export async function getProviderReviews(providerId) {
    const provider = await findProviderById(providerId);
    if (!provider) {
      throw new AppError('Prestador no encontrado', 404);
    }
  
    const reviews = await findReviewsByProviderId(providerId);
  
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
      : 0;
  
    return {
      averageRating,
      totalReviews,
      reviews,
    };
  }