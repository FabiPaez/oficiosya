import request from 'supertest';
import app from '../../src/app.js';
import { getClientToken } from '../helpers/auth.helper.js';

describe('Profiles Integration Tests', () => {
  let clientToken;

  beforeAll(async () => {
    clientToken = await getClientToken();
  });

  describe('GET /api/profiles/me', () => {
    test('debe devolver 401 si no se envía token', async () => {
      const response = await request(app)
        .get('/api/profiles/me');

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Token de autenticación requerido');
    });

    test('debe devolver el perfil del usuario autenticado (200)', async () => {
      const response = await request(app)
        .get('/api/profiles/me')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.first_name).toBeDefined();
    });
  });

  describe('PATCH /api/profiles/me', () => {
    test('debe devolver 401 si no se envía token', async () => {
      const response = await request(app)
        .patch('/api/profiles/me')
        .send({ firstName: 'NuevoNombre' });

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Token de autenticación requerido');
    });

    test('debe devolver 400 si los datos de entrada son inválidos', async () => {
      const response = await request(app)
        .patch('/api/profiles/me')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          firstName: 'A', // Mínimo 2 caracteres según validator
          phone: 'abc',   // Formato inválido según regex
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Datos de entrada inválidos');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    test('debe actualizar el perfil correctamente con datos válidos (200)', async () => {
      const updatedFirstName = `TestName${Date.now().toString().slice(-4)}`;
      const updatedLastName = 'TestLastName';
      const updatedPhone = '2641234567';

      const response = await request(app)
        .patch('/api/profiles/me')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          firstName: updatedFirstName,
          lastName: updatedLastName,
          phone: updatedPhone,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Perfil actualizado correctamente');
      expect(response.body.data.first_name).toBe(updatedFirstName);
      expect(response.body.data.last_name).toBe(updatedLastName);
      expect(response.body.data.phone).toBe(updatedPhone);

      // Verificación de persistencia mediante lectura
      const verifyRes = await request(app)
        .get('/api/profiles/me')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(verifyRes.statusCode).toBe(200);
      expect(verifyRes.body.data.first_name).toBe(updatedFirstName);
    });
  });
});