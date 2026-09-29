import { Router } from 'express';
import {
  createReviewController,
  getReviewByIdController,
  getProviderReviewsController,
} from '../controllers/reviews.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createReviewSchema } from '../validators/reviews.validator.js';

const router = Router();

// Consultar calificaciones de un prestador (público)
router.get('/provider/:providerId', getProviderReviewsController);

// Consultar reseña puntual por ID (público)
router.get('/:id', getReviewByIdController);

// Crear reseña (requiere cliente autenticado)
router.post(
  '/',
  authenticate,
  validate(createReviewSchema),
  createReviewController
);

export default router;