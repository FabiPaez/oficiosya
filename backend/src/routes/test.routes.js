import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

import {
  clientTest,
  providerTest,
  adminTest,
} from '../controllers/test.controller.js';

const router = Router();

router.get(
  '/client',
  authenticate,
  authorize('CLIENT'),
  clientTest
);

router.get(
  '/provider',
  authenticate,
  authorize('PROVIDER'),
  providerTest
);

router.get(
  '/admin',
  authenticate,
  authorize('ADMIN'),
  adminTest
);

export default router;