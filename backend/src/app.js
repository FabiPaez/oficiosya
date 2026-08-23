import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

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

export default app;