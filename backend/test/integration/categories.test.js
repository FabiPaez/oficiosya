import request from 'supertest';
import app from '../../src/app.js';

describe('GET /api/categories', () => {
  test('debe devolver las categorías activas', async () => {
    const response = await request(app)
      .get('/api/categories');

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data).toBeDefined();

    expect(Array.isArray(response.body.data)).toBe(true);

    expect(
      response.body.data.every(
        (category) => category.is_active === true
      )
    ).toBe(true);
  });
});

describe('GET /api/categories/:id', () => {
  test('debe devolver una categoría existente', async () => {
    const response = await request(app)
      .get('/api/categories/1');

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data).toBeDefined();

    expect(response.body.data.id).toBe(1);
  });

  test('debe devolver 404 si la categoría no existe', async () => {
    const response = await request(app)
      .get('/api/categories/99999');

    expect(response.statusCode).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message)
      .toBe('Categoría no encontrada');
  });
});