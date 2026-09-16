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

describe('POST /api/auth/login - prueba de autenticación', () => {
  test('debe iniciar sesión correctamente con un usuario válido', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@oficiosya.com',
        password: 'Admin1234!',
      });

    console.log('LOGIN TEST:', {
      status: response.statusCode,
      success: response.body.success,
      hasAccessToken:
        !!response.body.data?.session?.access_token,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(
      response.body.data.session.access_token
    ).toBeDefined();
  });
});