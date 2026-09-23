import request from 'supertest';
import app from '../../src/app.js';
import { getAdminToken, getClientToken } from '../helpers/auth.helper.js';
import {
  deleteServiceRequestsByIds,
  deleteServicesByIds,
  removeProviderRoleByUserIds,
} from '../helpers/db-cleanup.helper.js';

let createdRequestIds = [];
let testServiceId;
let testProviderId;

afterEach(async () => {
  await deleteServiceRequestsByIds(createdRequestIds);
  createdRequestIds = [];
});

afterAll(async () => {
  if (testServiceId) {
    await deleteServicesByIds([testServiceId]);
  }
  if (testProviderId) {
    await removeProviderRoleByUserIds([testProviderId]);
  }
});

describe('POST /api/service-requests', () => {
  let clientToken;
  let adminToken;

  beforeAll(async () => {
    clientToken = await getClientToken();
    adminToken = await getAdminToken();

    // 1. Crear un servicio base con ADMIN
    const serviceRes = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId: 1,
        name: `Servicio Solicitudes ${Date.now()}`,
      });
    testServiceId = serviceRes.body.data.id;

    // 2. Registrar al ADMIN como prestador para que el CLIENT pueda solicitarle
    const providerRes = await request(app)
      .post('/api/providers/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        description: 'Prestador asignado para recibir solicitudes de prueba',
        city: 'San José de Jáchal',
      });
    testProviderId = providerRes.body.data.id;
  });

  test('debe devolver 401 si no se envía token', async () => {
    const response = await request(app)
      .post('/api/service-requests')
      .send({
        providerId: testProviderId,
        serviceId: testServiceId,
        title: 'Reparación de tablero eléctrico',
        description: 'Salta la térmica al encender el aire acondicionado.',
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Token de autenticación requerido');
  });

  test('debe crear exitosamente una solicitud de servicio (201)', async () => {
    const response = await request(app)
      .post('/api/service-requests')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        providerId: testProviderId,
        serviceId: testServiceId,
        title: 'Reparación de disyuntor',
        description: 'Corte intermitente en circuito de cocina.',
        address: 'San Martín 450',
        city: 'Jáchal',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Solicitud de servicio creada correctamente');
    expect(response.body.data).toBeDefined();
    expect(response.body.data.title).toBe('Reparación de disyuntor');
    expect(response.body.data.status).toBe('PENDING');

    createdRequestIds.push(response.body.data.id);
  });

  test('debe devolver 400 si los datos de entrada son inválidos (Zod)', async () => {
    const response = await request(app)
      .post('/api/service-requests')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        providerId: testProviderId,
        serviceId: testServiceId,
        title: 'No', // Título menor a 3 caracteres
        description: 'Corto',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Datos de entrada inválidos');
    expect(Array.isArray(response.body.errors)).toBe(true);
  });

  test('debe devolver 400 si el usuario intenta solicitarse un servicio a sí mismo', async () => {
    const response = await request(app)
      .post('/api/service-requests')
      .set('Authorization', `Bearer ${adminToken}`) // El emisor es el mismo provider
      .send({
        providerId: testProviderId,
        serviceId: testServiceId,
        title: 'Auto-solicitud indebida',
        description: 'No debería permitirse.',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('No puedes crear una solicitud de servicio hacia ti mismo');
  });

  test('debe devolver 404 si el providerId no existe', async () => {
    const response = await request(app)
      .post('/api/service-requests')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        providerId: '00000000-0000-0000-0000-000000000000',
        serviceId: testServiceId,
        title: 'Solicitud con prestador inexistente',
        description: 'Descripción para test de 404.',
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('El prestador especificado no existe o no tiene perfil habilitado');
  });
});

describe('GET /api/service-requests/me', () => {
  let clientToken;
  let adminToken;

  beforeAll(async () => {
    clientToken = await getClientToken();
    adminToken = await getAdminToken();
  });

  test('debe listar las solicitudes creadas por el cliente (200)', async () => {
    const createRes = await request(app)
      .post('/api/service-requests')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        providerId: testProviderId,
        serviceId: testServiceId,
        title: 'Pedido de presupuesto',
        description: 'Instalación de luminarias exteriores.',
      });

    createdRequestIds.push(createRes.body.data.id);

    const response = await request(app)
      .get('/api/service-requests/me')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/service-requests/:id', () => {
  let clientToken;

  beforeAll(async () => {
    clientToken = await getClientToken();
  });

  test('debe devolver 404 si la solicitud no existe', async () => {
    const response = await request(app)
      .get('/api/service-requests/99999')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Solicitud de servicio no encontrada');
  });

  test('debe devolver el detalle de una solicitud existente (200)', async () => {
    const createRes = await request(app)
      .post('/api/service-requests')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        providerId: testProviderId,
        serviceId: testServiceId,
        title: 'Detalle de prueba',
        description: 'Revisión técnica de tablero.',
      });

    const requestId = createRes.body.data.id;
    createdRequestIds.push(requestId);

    const response = await request(app)
      .get(`/api/service-requests/${requestId}`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(requestId);
    expect(response.body.data.title).toBe('Detalle de prueba');
    expect(response.body.data.services).toBeDefined();
  });
});

describe('PATCH /api/service-requests/:id/status', () => {
  let clientToken;

  beforeAll(async () => {
    clientToken = await getClientToken();
  });

  test('debe permitir al cliente cancelar una solicitud en estado PENDING (200)', async () => {
    const createRes = await request(app)
      .post('/api/service-requests')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        providerId: testProviderId,
        serviceId: testServiceId,
        title: 'Solicitud a cancelar',
        description: 'El usuario desiste del pedido.',
      });

    const requestId = createRes.body.data.id;
    createdRequestIds.push(requestId);

    const response = await request(app)
      .patch(`/api/service-requests/${requestId}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'CANCELLED' });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Estado de la solicitud actualizado correctamente');
    expect(response.body.data.status).toBe('CANCELLED');
  });

  test('debe devolver 400 si se envía un estado no válido', async () => {
    const response = await request(app)
      .patch('/api/service-requests/1/status')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'ESTADO_INVENTADO' });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Datos de entrada inválidos');
  });
});