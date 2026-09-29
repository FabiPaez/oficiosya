import request from 'supertest';
import app from '../../src/app.js';

describe('Swagger Documentation (GET /api-docs)', () => {
  test('debe responder con estado 200 o redirección 301 a la UI de Swagger', async () => {
    const response = await request(app).get('/api-docs/');
    expect([200, 301]).toContain(response.statusCode);
  });
});