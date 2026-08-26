import request from 'supertest';
import app from '../../src/app.js';

describe('GET /api/health', () => {
  test('debe devolver estado 200', async () => {
    const response = await request(app)
      .get('/api/health');

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: 'OficiosYa API funcionando correctamente',
    });
  });
});