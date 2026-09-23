import { Router } from 'express';
import {
  createServiceRequestController,
  getServiceRequestByIdController,
  getMyServiceRequestsController,
  updateServiceRequestStatusController,
} from '../controllers/service-requests.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createServiceRequestSchema,
  updateServiceRequestStatusSchema,
} from '../validators/service-requests.validator.js';

const router = Router();

// Todas las operaciones requieren usuario autenticado
router.post(
  '/',
  authenticate,
  validate(createServiceRequestSchema),
  createServiceRequestController
);

router.get('/me', authenticate, getMyServiceRequestsController);
router.get('/:id', authenticate, getServiceRequestByIdController);

router.patch(
  '/:id/status',
  authenticate,
  validate(updateServiceRequestStatusSchema),
  updateServiceRequestStatusController
);

export default router;