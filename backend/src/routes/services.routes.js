import { Router } from 'express';
import {
  getServicesController,
  getServiceByIdController,
  createServiceController,
  updateServiceController,
  deactivateServiceController,
} from '../controllers/services.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';
import { optionalAuthenticate } from '../middlewares/optional-auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createServiceSchema,
  updateServiceSchema,
} from '../validators/services.validator.js';

const router = Router();

router.get('/', optionalAuthenticate, getServicesController);
router.get('/:id', getServiceByIdController);

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createServiceSchema),
  createServiceController
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateServiceSchema),
  updateServiceController
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  deactivateServiceController
);

export default router;