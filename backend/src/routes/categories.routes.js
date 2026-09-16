import { Router } from 'express';

import {
  getCategoriesController,
  getCategoryByIdController,
  createCategoryController,
  updateCategoryController,
  deactivateCategoryController,
} from '../controllers/categories.controller.js';

import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

import { validate } from '../middlewares/validate.middleware.js';
import { optionalAuthenticate } from '../middlewares/optional-auth.middleware.js';

import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/categories.validator.js';

const router = Router();

// Público
router.get(
  '/',
  optionalAuthenticate,
  getCategoriesController
);

router.get(
  '/:id',
  getCategoryByIdController
);

// Solo ADMIN
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createCategorySchema),
  createCategoryController
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateCategorySchema),
  updateCategoryController
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  deactivateCategoryController
);

export default router;