import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { getAdminToken, getClientToken } from '../helpers/auth.helper.js';
import {
  deleteFavoritesByUserAndProviders,
  removeProviderRoleByUserIds,
} from '../helpers/db-cleanup.helper.js';

jest.setTimeout(30000);

let createdFavorites = [];
let testProviderId;
let clientUserId;
let clientToken;
let adminToken;
let weAssignedProviderRole = false;

beforeAll(async () => {
  clientToken = await getClientToken();
  adminToken = await getAdminToken();

  // 1. Obtener ID del CLIENT
  const clientProfile = await request(app)
    .get('/api/profiles/me')
    .set('Authorization', `Bearer ${clientToken}`);
  clientUserId = clientProfile.body.data.id;

  // 2. Obtener ID del ADMIN
  const adminProfile = await request(app)
    .get('/api/profiles/me')
    .set('Authorization', `Bearer ${adminToken}`);
  testProviderId = adminProfile.body.data.id;

  // 3. Asegurar que el ADMIN tenga perfil de prestador
  const providerRes = await request(app)
    .post('/api/providers/register')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      description: 'Prestador para pruebas de favoritos',
      city: 'Jáchal',
    });

  if (providerRes.statusCode === 201) {
    weAssignedProviderRole = true;
  }
});

afterEach(async () => {
  await deleteFavoritesByUserAndProviders(createdFavorites);
  createdFavorites = [];
});

afterAll(async () => {
  if (testProviderId && weAssignedProviderRole) {
    await removeProviderRoleByUserIds([testProviderId]);
  }
});

describe('POST /api/favorites', () => {
  test('debe devolver 401 si no se envía token', async () => {
    const response = await request(app)
      .post('/api/favorites')
      .send({
        providerId: testProviderId,
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Token de autenticación requerido');
  });

  test('debe devolver 400 si el providerId no es un UUID válido', async () => {
    const response = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        providerId: 'id-invalido',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Datos de entrada inválidos');
  });

  test('debe devolver 400 si el usuario intenta agregarse a sí mismo como favorito', async () => {
    const response = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${adminToken}`) // Emisor ADMIN intentando agregarse a sí mismo
      .send({
        providerId: testProviderId,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('No puedes agregarte a ti mismo como favorito');
  });

  test('debe devolver 404 si el prestador no existe', async () => {
    const response = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        providerId: '00000000-0000-0000-0000-000000000000',
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('El prestador no existe o no tiene perfil activo');
  });

  test('debe agregar un prestador a favoritos exitosamente (201)', async () => {
    const response = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        providerId: testProviderId,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Prestador agregado a favoritos');
    expect(response.body.data).toBeDefined();
    expect(response.body.data.provider_id).toBe(testProviderId);

    createdFavorites.push({ userId: clientUserId, providerId: testProviderId });
  });

  test('debe devolver 409 si el prestador ya se encuentra en favoritos', async () => {
    // 1. Primera inserción exitosa
    const firstRes = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        providerId: testProviderId,
      });

    createdFavorites.push({ userId: clientUserId, providerId: testProviderId });

    // 2. Segundo intento duplicado
    const secondRes = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        providerId: testProviderId,
      });

    expect(secondRes.statusCode).toBe(409);
    expect(secondRes.body.success).toBe(false);
    expect(secondRes.body.message).toBe('El prestador ya se encuentra en tus favoritos');
  });
});

describe('GET /api/favorites', () => {
  test('debe listar los prestadores favoritos del usuario autenticado (200)', async () => {
    // 1. Agregar a favoritos
    await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        providerId: testProviderId,
      });

    createdFavorites.push({ userId: clientUserId, providerId: testProviderId });

    // 2. Consultar lista
    const response = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data[0].profiles).toBeDefined();
  });
});

describe('DELETE /api/favorites/:providerId', () => {
  test('debe remover un prestador de favoritos exitosamente (200)', async () => {
    // 1. Agregar a favoritos
    await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        providerId: testProviderId,
      });

    createdFavorites.push({ userId: clientUserId, providerId: testProviderId });

    // 2. Eliminar de favoritos
    const response = await request(app)
      .delete(`/api/favorites/${testProviderId}`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Prestador eliminado de favoritos');
  });

  test('debe devolver 404 si el prestador no estaba en favoritos', async () => {
    const response = await request(app)
      .delete(`/api/favorites/${testProviderId}`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('El prestador no se encuentra en tus favoritos');
  });
});