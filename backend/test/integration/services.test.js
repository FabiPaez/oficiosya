import request from 'supertest';
import app from '../../src/app.js';
import { getAdminToken, getClientToken } from '../helpers/auth.helper.js';
import { deleteServicesByIds } from '../helpers/db-cleanup.helper.js';

let createdServiceIds = [];

afterEach(async () => {
  await deleteServicesByIds(createdServiceIds);
  createdServiceIds = [];
});

describe('GET /api/services', () => {
  test('debe devolver servicios activos (200)', async () => {
    const response = await request(app)
      .get('/api/services');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('debe filtrar servicios por categoryId', async () => {
    const response = await request(app)
      .get('/api/services?categoryId=1');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(
      response.body.data.every((service) => service.category_id === 1)
    ).toBe(true);
  });
});

describe('GET /api/services/:id', () => {
  test('debe devolver 404 si el servicio no existe', async () => {
    const response = await request(app)
      .get('/api/services/99999');

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Servicio no encontrado');
  });
});

describe('POST /api/services', () => {
  let adminToken;
  let clientToken;

  beforeAll(async () => {
    adminToken = await getAdminToken();
    clientToken = await getClientToken();
  });

  test('debe permitir crear un servicio siendo ADMIN (201)', async () => {
    const uniqueServiceName = `Servicio Test ${Date.now()}`;

    const response = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId: 1,
        name: uniqueServiceName,
        description: 'Descripción de prueba para servicio',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Servicio creado correctamente');
    expect(response.body.data).toBeDefined();
    expect(response.body.data.name).toBe(uniqueServiceName);
    expect(response.body.data.category_id).toBe(1);
    expect(response.body.data.is_active).toBe(true);

    createdServiceIds.push(response.body.data.id);
  });

  test('debe devolver 403 si un usuario con rol CLIENT intenta crear un servicio', async () => {
    const response = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        categoryId: 1,
        name: `Forbidden Service ${Date.now()}`,
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('No tienes permisos para realizar esta operación');
  });

  test('debe devolver 404 si la categoría asociada no existe', async () => {
    const response = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId: 99999,
        name: `Servicio Inexistente ${Date.now()}`,
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('La categoría asociada no existe');
  });

  test('debe devolver 409 si ya existe un servicio con el mismo nombre en la categoría', async () => {
    const duplicateName = `Duplicate Service ${Date.now()}`;

    const firstRes = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId: 1,
        name: duplicateName,
      });

    createdServiceIds.push(firstRes.body.data.id);

    const secondRes = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId: 1,
        name: duplicateName,
      });

    expect(secondRes.statusCode).toBe(409);
    expect(secondRes.body.success).toBe(false);
    expect(secondRes.body.message).toBe('Ya existe un servicio con ese nombre en esta categoría');
  });

  test('debe devolver 400 si los datos no cumplen la validación de Zod', async () => {
    const response = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId: -1,
        name: 'A',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Datos de entrada inválidos');
    expect(Array.isArray(response.body.errors)).toBe(true);
  });
});

describe('PATCH /api/services/:id', () => {
  let adminToken;
  let clientToken;

  beforeAll(async () => {
    adminToken = await getAdminToken();
    clientToken = await getClientToken();
  });

  test('debe permitir actualizar un servicio siendo ADMIN (200)', async () => {
    const createRes = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId: 1,
        name: `Pre Patch Service ${Date.now()}`,
      });

    const serviceId = createRes.body.data.id;
    createdServiceIds.push(serviceId);

    const updatedName = `Post Patch Service ${Date.now()}`;
    const response = await request(app)
      .patch(`/api/services/${serviceId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: updatedName,
        description: 'Descripción actualizada',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Servicio actualizado correctamente');
    expect(response.body.data.name).toBe(updatedName);
    expect(response.body.data.description).toBe('Descripción actualizada');
  });

  test('debe devolver 403 si un usuario CLIENT intenta actualizar', async () => {
    const response = await request(app)
      .patch('/api/services/1')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Intento no permitido',
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('No tienes permisos para realizar esta operación');
  });

  test('debe devolver 404 si el servicio a actualizar no existe', async () => {
    const response = await request(app)
      .patch('/api/services/99999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Inexistente',
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Servicio no encontrado');
  });
});

describe('DELETE /api/services/:id', () => {
  let adminToken;
  let clientToken;

  beforeAll(async () => {
    adminToken = await getAdminToken();
    clientToken = await getClientToken();
  });

  test('debe desactivar un servicio siendo ADMIN (200 / soft delete)', async () => {
    const createRes = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId: 1,
        name: `Delete Service ${Date.now()}`,
      });

    const serviceId = createRes.body.data.id;
    createdServiceIds.push(serviceId);

    const response = await request(app)
      .delete(`/api/services/${serviceId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Servicio desactivado correctamente');
    expect(response.body.data.is_active).toBe(false);
  });

  test('debe devolver 403 si un usuario CLIENT intenta desactivar', async () => {
    const response = await request(app)
      .delete('/api/services/1')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('No tienes permisos para realizar esta operación');
  });

  test('debe devolver 409 si el servicio ya se encuentra inactivo', async () => {
    const createRes = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId: 1,
        name: `Already Inactive Service ${Date.now()}`,
      });

    const serviceId = createRes.body.data.id;
    createdServiceIds.push(serviceId);

    // Primera desactivación
    await request(app)
      .delete(`/api/services/${serviceId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Segundo intento
    const response = await request(app)
      .delete(`/api/services/${serviceId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('El servicio ya está inactivo');
  });
});