import { Router } from 'express';
import {
  getMyFavoritesController,
  addFavoriteController,
  removeFavoriteController,
} from '../controllers/favorites.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { addFavoriteSchema } from '../validators/favorites.validator.js';

const router = Router();

router.get('/', authenticate, getMyFavoritesController);
router.post('/', authenticate, validate(addFavoriteSchema), addFavoriteController);
router.delete('/:providerId', authenticate, removeFavoriteController);

export default router;