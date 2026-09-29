import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { getAdminToken, getClientToken } from '../helpers/auth.helper.js';
import {
  deleteReviewsByIds,
  deleteServiceRequestsByIds,
  deleteServicesByIds,
  removeProviderRoleByUserIds,
} from '../helpers/db-cleanup.helper.js';

jest.setTimeout(30000);

let createdReviewIds = [];
let createdRequestIds = [];
let testServiceId;
let testProviderId;
let clientToken;
let adminToken;
let weAssignedProviderRole = false;

beforeAll(async () => {
  clientToken = await getClientToken();
  adminToken = await getAdminToken();

  // 1. Obtener ID del ADMIN mediante su perfil
  const adminProfileRes = await request(app)
    .get('/api/profiles/me')
    .set('Authorization', `Bearer ${adminToken}`);

  testProviderId = adminProfileRes.body.data.id;

  // 2. Asegurar que ADMIN esté habilitado como prestador
  const providerRes = await request(app)
    .post('/api/providers/register')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      description: 'Prestador para recibir reseñas de prueba',
      city: 'Jáchal',
    });

  if (providerRes.statusCode === 201) {
    weAssignedProviderRole = true;
  }

  // 3. Crear servicio de prueba garantizado
  const serviceRes = await request(app)
    .post('/api/services')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      categoryId: 1,
      name: `Servicio Reviews ${Date.now()}`,
    });

  testServiceId = serviceRes.body.data.id;
});

afterEach(async () => {
  await deleteReviewsByIds(createdReviewIds);
  createdReviewIds = [];

  await deleteServiceRequestsByIds(createdRequestIds);
  createdRequestIds = [];
});

afterAll(async () => {
  if (testServiceId) {
    await deleteServicesByIds([testServiceId]);
  }
  if (testProviderId && weAssignedProviderRole) {
    await removeProviderRoleByUserIds([testProviderId]);
  }
});

describe('POST /api/reviews', () => {
  test('debe devolver 401 si no se envía token', async () => {
    const response = await request(app)
      .post('/api/reviews')
      .send({
        requestId: 1,
        rating: 5,
        comment: 'Excelente trabajo',
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Token de autenticación requerido');
  });

  test('debe devolver 400 si el rating está fuera de rango (1 a 5)', async () => {
    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        requestId: 1,
        rating: 6,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Datos de entrada inválidos');
  });

  test('debe devolver 409 si la solicitud no está en estado COMPLETED', async () => {
    const reqRes = await request(app)
      .post('/api/service-requests')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        providerId: testProviderId,
        serviceId: testServiceId,
        title: 'Trabajo pendiente de calificación',
        description: 'No debería poder calificarse aún.',
      });

    const requestId = reqRes.body.data.id;
    createdRequestIds.push(requestId);

    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        requestId,
        rating: 4,
        comment: 'Prematuro',
      });

    expect(response.statusCode).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Solo se pueden calificar solicitudes en estado COMPLETED');
  });

  test('debe calificar exitosamente una solicitud completada (201)', async () => {
    const reqRes = await request(app)
      .post('/api/service-requests')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        providerId: testProviderId,
        serviceId: testServiceId,
        title: 'Instalación eléctrica terminada',
        description: 'Servicio finalizado con éxito.',
      });

    const requestId = reqRes.body.data.id;
    createdRequestIds.push(requestId);

    await request(app)
      .patch(`/api/service-requests/${requestId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'COMPLETED' });

    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        requestId,
        rating: 5,
        comment: 'Muy prolijo, puntual y recomendable.',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Calificación registrada correctamente');
    expect(response.body.data).toBeDefined();
    expect(response.body.data.rating).toBe(5);
    expect(response.body.data.comment).toBe('Muy prolijo, puntual y recomendable.');

    createdReviewIds.push(response.body.data.id);
  });

  test('debe devolver 409 si la solicitud ya fue calificada previamente', async () => {
    const reqRes = await request(app)
      .post('/api/service-requests')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        providerId: testProviderId,
        serviceId: testServiceId,
        title: 'Trabajo doble reseña',
        description: 'Test de unicidad de calificación.',
      });

    const requestId = reqRes.body.data.id;
    createdRequestIds.push(requestId);

    await request(app)
      .patch(`/api/service-requests/${requestId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'COMPLETED' });

    const firstReview = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        requestId,
        rating: 5,
      });

    createdReviewIds.push(firstReview.body.data.id);

    const secondReview = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        requestId,
        rating: 3,
      });

    expect(secondReview.statusCode).toBe(409);
    expect(secondReview.body.success).toBe(false);
    expect(secondReview.body.message).toBe('Esta solicitud de servicio ya ha sido calificada');
  });

  test('debe devolver 403 si un usuario ajeno a la solicitud intenta calificar', async () => {
    const reqRes = await request(app)
      .post('/api/service-requests')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        providerId: testProviderId,
        serviceId: testServiceId,
        title: 'Trabajo para test 403',
        description: 'Intento de calificar por tercero.',
      });

    const requestId = reqRes.body.data.id;
    createdRequestIds.push(requestId);

    await request(app)
      .patch(`/api/service-requests/${requestId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'COMPLETED' });

    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        requestId,
        rating: 5,
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Solo el cliente que solicitó el servicio puede calificarlo');
  });
});

describe('GET /api/reviews/provider/:providerId', () => {
  test('debe devolver el promedio y la lista de calificaciones del prestador (200)', async () => {
    const reqRes = await request(app)
      .post('/api/service-requests')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        providerId: testProviderId,
        serviceId: testServiceId,
        title: 'Trabajo para consulta pública',
        description: 'Verificación de promedio.',
      });

    const requestId = reqRes.body.data.id;
    createdRequestIds.push(requestId);

    await request(app)
      .patch(`/api/service-requests/${requestId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'COMPLETED' });

    const reviewRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        requestId,
        rating: 4,
        comment: 'Buen servicio',
      });

    createdReviewIds.push(reviewRes.body.data.id);

    const response = await request(app)
      .get(`/api/reviews/provider/${testProviderId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalReviews).toBeGreaterThanOrEqual(1);
    expect(response.body.data.averageRating).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(response.body.data.reviews)).toBe(true);
  });
});

describe('GET /api/reviews/:id', () => {
  test('debe devolver 404 si la reseña no existe', async () => {
    const response = await request(app)
      .get('/api/reviews/99999');

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Reseña no encontrada');
  });
});