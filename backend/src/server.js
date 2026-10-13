import app from './app.js';
import env from './config/env.js';

app.listen(env.port, '0.0.0.0', () => {
  console.log(`OficiosYa API escuchando en el puerto ${env.port}`);
});