import request from 'supertest';
import app from '../../src/app.js';

describe('POST /api/auth/register', () => {
  test('debe rechazar datos inválidos', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'email-invalido',
        password: '123',
        firstName: '',
        lastName: '',
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message)
      .toBe('Datos de entrada inválidos');

    expect(response.body.errors).toBeDefined();
  });

  test('debe rechazar /me sin token', async () => {
    const response = await request(app)
      .get('/api/auth/me');
  
    expect(response.statusCode).toBe(401);
  
    expect(response.body.success).toBe(false);
  });

  test('debe rechazar login con datos inválidos', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'email-invalido',
        password: '',
      });
  
    expect(response.statusCode).toBe(400);
  
    expect(response.body.success).toBe(false);
  });
});