import request from 'supertest';
import app from '../../src/app.js';
import { getAdminToken, getClientToken } from '../helpers/auth.helper.js';
import {
  deleteProviderServicesByIds,
  removeProviderRoleByUserIds,
  deleteServicesByIds,
} from '../helpers/db-cleanup.helper.js';

let createdProviderServiceIds = [];
let assignedProviderUserIds = [];
let testServiceId;

afterEach(async () => {
  await deleteProviderServicesByIds(createdProviderServiceIds);
  createdProviderServiceIds = [];

  await removeProviderRoleByUserIds(assignedProviderUserIds);
  assignedProviderUserIds = [];
});

afterAll(async () => {
  if (testServiceId) {
    await deleteServicesByIds([testServiceId]);
  }
});

describe('POST /api/provider-services', () => {
  let clientToken;
  let adminToken;

  beforeAll(async () => {
    clientToken = await getClientToken();
    adminToken = await getAdminToken();

    // Crear un servicio de prueba garantizado para toda la suite
    const serviceRes = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId: 1,
        name: `Servicio Base Tests ${Date.now()}`,
        description: 'Servicio para pruebas de vinculación',
      });

    testServiceId = serviceRes.body.data.id;
  });

  test('debe devolver 401 si no se envía token', async () => {
    const response = await request(app)
      .post('/api/provider-services')
      .send({
        serviceId: testServiceId,
        priceFrom: 1500,
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Token de autenticación requerido');
  });

  test('debe devolver 403 si el usuario no tiene rol PROVIDER', async () => {
    const response = await request(app)
      .post('/api/provider-services')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        serviceId: testServiceId,
        priceFrom: 1500,
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('No tienes permisos para realizar esta operación');
  });

  test('debe devolver 400 si el precio inicial supera al precio final (Zod refine)', async () => {
    const regRes = await request(app)
      .post('/api/providers/register')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ description: 'Prestador de prueba para validación de precios' });

    assignedProviderUserIds.push(regRes.body.data.id);

    const response = await request(app)
      .post('/api/provider-services')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        serviceId: testServiceId,
        priceFrom: 5000,
        priceTo: 3000,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Datos de entrada inválidos');
  });

  test('debe vincular un servicio exitosamente al prestador (201)', async () => {
    const regRes = await request(app)
      .post('/api/providers/register')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ description: 'Prestador para vinculación' });

    assignedProviderUserIds.push(regRes.body.data.id);

    const response = await request(app)
      .post('/api/provider-services')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        serviceId: testServiceId,
        priceFrom: 2000,
        priceTo: 4500,
        description: 'Mano de obra especializada con presupuesto sin cargo',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Servicio vinculado correctamente al prestador');
    expect(response.body.data).toBeDefined();
    expect(response.body.data.service_id).toBe(testServiceId);
    expect(Number(response.body.data.price_from)).toBe(2000);
    expect(response.body.data.is_active).toBe(true);

    createdProviderServiceIds.push(response.body.data.id);
  });

  test('debe devolver 409 si el prestador intenta vincular dos veces el mismo servicio', async () => {
    const regRes = await request(app)
      .post('/api/providers/register')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ description: 'Prestador para test de duplicados' });

    assignedProviderUserIds.push(regRes.body.data.id);

    const firstRes = await request(app)
      .post('/api/provider-services')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ serviceId: testServiceId });

    createdProviderServiceIds.push(firstRes.body.data.id);

    const secondRes = await request(app)
      .post('/api/provider-services')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ serviceId: testServiceId });

    expect(secondRes.statusCode).toBe(409);
    expect(secondRes.body.success).toBe(false);
    expect(secondRes.body.message).toBe('Ya tienes vinculado este servicio en tu perfil');
  });
});

describe('GET /api/provider-services/provider/:providerId', () => {
  let clientToken;

  beforeAll(async () => {
    clientToken = await getClientToken();
  });

  test('debe devolver la lista de servicios que ofrece un prestador (200)', async () => {
    const regRes = await request(app)
      .post('/api/providers/register')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ description: 'Prestador consulta pública' });

    const providerId = regRes.body.data.id;
    assignedProviderUserIds.push(providerId);

    const linkRes = await request(app)
      .post('/api/provider-services')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ serviceId: testServiceId, priceFrom: 3000 });

    createdProviderServiceIds.push(linkRes.body.data.id);

    const response = await request(app)
      .get(`/api/provider-services/provider/${providerId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data[0].services).toBeDefined();
  });
});

describe('PATCH /api/provider-services/:id', () => {
  let clientToken;

  beforeAll(async () => {
    clientToken = await getClientToken();
  });

  test('debe actualizar los precios y descripción de un servicio propio (200)', async () => {
    const regRes = await request(app)
      .post('/api/providers/register')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ description: 'Prestador para update' });

    assignedProviderUserIds.push(regRes.body.data.id);

    const linkRes = await request(app)
      .post('/api/provider-services')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ serviceId: testServiceId, priceFrom: 1000 });

    const relationId = linkRes.body.data.id;
    createdProviderServiceIds.push(relationId);

    const response = await request(app)
      .patch(`/api/provider-services/${relationId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        priceFrom: 2500,
        priceTo: 6000,
        description: 'Tarifa actualizada por inflación',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Servicio del prestador actualizado correctamente');
    expect(Number(response.body.data.price_from)).toBe(2500);
    expect(Number(response.body.data.price_to)).toBe(6000);
    expect(response.body.data.description).toBe('Tarifa actualizada por inflación');
  });

  test('debe devolver 404 si el servicio del prestador no existe', async () => {
    const response = await request(app)
      .patch('/api/provider-services/99999')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ priceFrom: 1000 });

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Servicio de prestador no encontrado');
  });
});

describe('DELETE /api/provider-services/:id', () => {
  let clientToken;

  beforeAll(async () => {
    clientToken = await getClientToken();
  });

  test('debe desactivar el servicio de un prestador (200 / soft delete)', async () => {
    const regRes = await request(app)
      .post('/api/providers/register')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ description: 'Prestador para soft delete' });

    assignedProviderUserIds.push(regRes.body.data.id);

    const linkRes = await request(app)
      .post('/api/provider-services')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ serviceId: testServiceId });

    const relationId = linkRes.body.data.id;
    createdProviderServiceIds.push(relationId);

    const response = await request(app)
      .delete(`/api/provider-services/${relationId}`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Servicio del prestador desactivado correctamente');
    expect(response.body.data.is_active).toBe(false);
  });

  test('debe devolver 409 si el servicio ya está inactivo', async () => {
    const regRes = await request(app)
      .post('/api/providers/register')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ description: 'Prestador para duplicado de delete' });

    assignedProviderUserIds.push(regRes.body.data.id);

    const linkRes = await request(app)
      .post('/api/provider-services')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ serviceId: testServiceId });

    const relationId = linkRes.body.data.id;
    createdProviderServiceIds.push(relationId);

    // Primera desactivación
    await request(app)
      .delete(`/api/provider-services/${relationId}`)
      .set('Authorization', `Bearer ${clientToken}`);

    // Segundo intento
    const response = await request(app)
      .delete(`/api/provider-services/${relationId}`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(response.statusCode).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('El servicio ya se encuentra inactivo');
  });
});