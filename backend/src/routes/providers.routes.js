import { Router } from 'express';
import {
  registerProviderController,
  getProviderProfileController,
  updateProviderProfileController,
} from '../controllers/providers.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  registerProviderSchema,
  updateProviderProfileSchema,
} from '../validators/providers.validator.js';

const router = Router();

// Registro como prestador (requiere estar autenticado)
router.post('/register', authenticate, validate(registerProviderSchema), registerProviderController);

// Perfil propio de prestador
router.get('/me', authenticate, getProviderProfileController);
router.patch('/me', authenticate, validate(updateProviderProfileSchema), updateProviderProfileController);

// Perfil público de cualquier prestador por ID
router.get('/:id', getProviderProfileController);

export default router;