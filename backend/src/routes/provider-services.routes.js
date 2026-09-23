import { Router } from 'express';
import {
  getProviderServicesController,
  createProviderServiceController,
  updateProviderServiceController,
  deactivateProviderServiceController,
} from '../controllers/provider-services.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';
import { optionalAuthenticate } from '../middlewares/optional-auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createProviderServiceSchema,
  updateProviderServiceSchema,
} from '../validators/provider-services.validator.js';

const router = Router();

// Consultar servicios que ofrece un prestador
router.get('/provider/:providerId', optionalAuthenticate, getProviderServicesController);

// Asociar un servicio (requiere rol PROVIDER)
router.post(
  '/',
  authenticate,
  authorize('PROVIDER'),
  validate(createProviderServiceSchema),
  createProviderServiceController
);

// Modificar servicio propio
router.patch(
  '/:id',
  authenticate,
  validate(updateProviderServiceSchema),
  updateProviderServiceController
);

// Desactivar servicio propio
router.delete(
  '/:id',
  authenticate,
  deactivateProviderServiceController
);

export default router;