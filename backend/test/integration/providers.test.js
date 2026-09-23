import request from 'supertest';
import app from '../../src/app.js';
import { getClientToken } from '../helpers/auth.helper.js';
import { removeProviderRoleByUserIds } from '../helpers/db-cleanup.helper.js';

let assignedProviderUserIds = [];

afterEach(async () => {
  await removeProviderRoleByUserIds(assignedProviderUserIds);
  assignedProviderUserIds = [];
});

describe('POST /api/providers/register', () => {
  let clientToken;

  beforeAll(async () => {
    clientToken = await getClientToken();
  });

  test('debe devolver 401 si no se envía token', async () => {
    const response = await request(app)
      .post('/api/providers/register')
      .send({
        description: 'Electricista matriculado',
        city: 'San José de Jáchal',
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Token de autenticación requerido');
  });

  test('debe registrar exitosamente al usuario como prestador (201)', async () => {
    const response = await request(app)
      .post('/api/providers/register')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        description: 'Instalaciones eléctricas y reparaciones en general.',
        city: 'San José de Jáchal',
        department: 'Jáchal',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Registro como prestador exitoso');
    expect(response.body.data).toBeDefined();
    expect(response.body.data.description).toBe('Instalaciones eléctricas y reparaciones en general.');
    expect(response.body.data.city).toBe('San José de Jáchal');

    assignedProviderUserIds.push(response.body.data.id);
  });

  test('debe devolver 409 si el usuario ya está registrado como prestador', async () => {
    const firstRes = await request(app)
      .post('/api/providers/register')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        description: 'Primera alta',
      });

    assignedProviderUserIds.push(firstRes.body.data.id);

    const secondRes = await request(app)
      .post('/api/providers/register')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        description: 'Intento de duplicación',
      });

    expect(secondRes.statusCode).toBe(409);
    expect(secondRes.body.success).toBe(false);
    expect(secondRes.body.message).toBe('El usuario ya se encuentra registrado como prestador');
  });
});

describe('GET /api/providers/:id', () => {
  let clientToken;

  beforeAll(async () => {
    clientToken = await getClientToken();
  });

  test('debe devolver 404 si el prestador no existe', async () => {
    const response = await request(app)
      .get('/api/providers/00000000-0000-0000-0000-000000000000');

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Prestador no encontrado');
  });

  test('debe devolver los datos del prestador por su ID público (200)', async () => {
    const registerRes = await request(app)
      .post('/api/providers/register')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        description: 'Perfil público de prueba',
        city: 'Jáchal',
      });

    const providerId = registerRes.body.data.id;
    assignedProviderUserIds.push(providerId);

    const response = await request(app)
      .get(`/api/providers/${providerId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(providerId);
    expect(response.body.data.description).toBe('Perfil público de prueba');
    expect(response.body.data.city).toBe('Jáchal');
  });
});

describe('PATCH /api/providers/me', () => {
  let clientToken;

  beforeAll(async () => {
    clientToken = await getClientToken();
  });

  test('debe actualizar los datos del prestador autenticado (200)', async () => {
    const registerRes = await request(app)
      .post('/api/providers/register')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        description: 'Descripción previa',
      });

    assignedProviderUserIds.push(registerRes.body.data.id);

    const response = await request(app)
      .patch('/api/providers/me')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        description: 'Descripción actualizada con éxito',
        city: 'San José de Jáchal',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Perfil de prestador actualizado correctamente');
    expect(response.body.data.description).toBe('Descripción actualizada con éxito');
    expect(response.body.data.city).toBe('San José de Jáchal');
  });
});