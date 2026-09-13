import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth.routes.js';
import categoriesRoutes from './routes/categories.routes.js';

import { errorMiddleware } from './middlewares/error.middleware.js';

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

app.use(errorMiddleware);

export default app;