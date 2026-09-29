import {
    createReview,
    getReviewById,
    getProviderReviews,
  } from '../services/reviews.service.js';
  
  export async function createReviewController(req, res, next) {
    try {
      const review = await createReview(req.user.id, req.body);
      return res.status(201).json({
        success: true,
        message: 'Calificación registrada correctamente',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }
  
  export async function getReviewByIdController(req, res, next) {
    try {
      const review = await getReviewById(req.params.id);
      return res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }
  
  export async function getProviderReviewsController(req, res, next) {
    try {
      const result = await getProviderReviews(req.params.providerId);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }