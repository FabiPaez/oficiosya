import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import profilesRoutes from './routes/profiles.routes.js';
import providersRoutes from './routes/providers.routes.js';
import servicesRoutes from './routes/services.routes.js';
import providerServicesRoutes from './routes/provider-services.routes.js';
import serviceRequestsRoutes from './routes/service-requests.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import favoritesRoutes from './routes/favorites.routes.js';

import { errorMiddleware } from './middlewares/error.middleware.js';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OficiosYa API funcionando correctamente',
  });
});

app.use('/api/auth', authRoutes);

app.use('/api/categories',categoriesRoutes);

app.use('/api/profiles', profilesRoutes);

app.use('/api/providers', providersRoutes);

app.use('/api/services', servicesRoutes);

app.use('/api/provider-services', providerServicesRoutes);

app.use('/api/service-requests', serviceRequestsRoutes);

app.use('/api/reviews', reviewsRoutes);

app.use('/api/favorites', favoritesRoutes);

app.use(errorMiddleware);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;