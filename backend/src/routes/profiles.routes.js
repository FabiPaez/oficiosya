import { Router } from 'express';
import {
  getMyProfileController,
  updateMyProfileController,
} from '../controllers/profiles.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateProfileSchema } from '../validators/profiles.validator.js';

const router = Router();

router.get('/me', authenticate, getMyProfileController);
router.patch('/me', authenticate, validate(updateProfileSchema), updateMyProfileController);

export default router;