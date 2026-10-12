import request from 'supertest';
import app from '../../src/app.js';
import {
  deleteAuthUserById,
  getAuthUserBootstrapById,
} from '../helpers/db-cleanup.helper.js';

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


  test('debe crear el perfil y asignar únicamente el rol CLIENT', async () => {
    const email = `oficiosya.test.${Date.now()}@example.com`;
    let userId;

    try {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: 'TestOficiosYa2026!',
          firstName: 'Usuario',
          lastName: 'Prueba',
          phone: '2645550101',
          role: 'ADMIN',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);

      userId = response.body.data?.user?.id;

      expect(userId).toBeDefined();

      const result = await getAuthUserBootstrapById(userId);

      expect(result.profile).toMatchObject({
        id: userId,
        first_name: 'Usuario',
        last_name: 'Prueba',
        phone: '2645550101',
      });

      expect(result.roles).toContain('CLIENT');
      expect(result.roles).not.toContain('ADMIN');
      expect(result.roles).not.toContain('PROVIDER');
    } finally {
      if (userId) {
        await deleteAuthUserById(userId);
      }
    }
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