import request from 'supertest';
import app from '../../src/app.js';
import { getAdminToken, getClientToken } from '../helpers/auth.helper.js';
import { deleteCategoriesByIds } from '../helpers/db-cleanup.helper.js';

// IDs de categorías creadas durante el test que se está ejecutando.
// Se resetea y se limpia en cada afterEach, así ningún test deja
// filas reales en la base, sin importar si pasó o falló.
let createdCategoryIds = [];

afterEach(async () => {
  await deleteCategoriesByIds(createdCategoryIds);
  createdCategoryIds = [];
});

describe('GET /api/categories', () => {
  test('debe devolver las categorías activas', async () => {
    const response = await request(app)
      .get('/api/categories');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(
      response.body.data.every(
        (category) => category.is_active === true
      )
    ).toBe(true);
  });
});

describe('GET /api/categories/:id', () => {
  test('debe devolver una categoría existente', async () => {
    const response = await request(app)
      .get('/api/categories/1');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.id).toBe(1);
  });

  test('debe devolver 404 si la categoría no existe', async () => {
    const response = await request(app)
      .get('/api/categories/99999');

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Categoría no encontrada');
  });
});

describe('POST /api/categories', () => {
  let adminToken;
  let clientToken;

  beforeAll(async () => {
    adminToken = await getAdminToken();
    clientToken = await getClientToken();
  });

  test('debe permitir crear una categoría siendo ADMIN (201)', async () => {
    const uniqueCategoryName = `Test Cat ${Date.now()}`;

    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: uniqueCategoryName,
        description: 'Categoría de prueba para test de integración',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Categoría creada correctamente');
    expect(response.body.data).toBeDefined();
    expect(response.body.data.name).toBe(uniqueCategoryName);
    expect(response.body.data.is_active).toBe(true);

    createdCategoryIds.push(response.body.data.id);
  });

  test('debe devolver 403 si un usuario con rol CLIENT intenta crear una categoría', async () => {
    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: `Forbidden Cat ${Date.now()}`,
        description: 'No debería crearse',
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('No tienes permisos para realizar esta operación');
    // No se crea nada: no hay id que registrar para limpieza.
  });

  test('debe devolver 409 si la categoría ya existe (nombre duplicado)', async () => {
    const duplicateName = `Duplicate Cat ${Date.now()}`;

    const firstResponse = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: duplicateName,
        description: 'Primera inserción',
      });

    createdCategoryIds.push(firstResponse.body.data.id);

    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: duplicateName,
        description: 'Segunda inserción duplicada',
      });

    expect(response.statusCode).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Ya existe una categoría con ese nombre');
  });

  test('debe devolver 400 si los datos de entrada son inválidos (Zod validation)', async () => {
    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'A',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Datos de entrada inválidos');
    expect(Array.isArray(response.body.errors)).toBe(true);
  });
});

describe('PATCH /api/categories/:id', () => {
  let adminToken;
  let clientToken;

  beforeAll(async () => {
    adminToken = await getAdminToken();
    clientToken = await getClientToken();
  });

  test('debe permitir actualizar una categoría siendo ADMIN (200)', async () => {
    const initialName = `Patch Initial ${Date.now()}`;
    const createRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: initialName,
        description: 'Descripción inicial',
      });

    const categoryId = createRes.body.data.id;
    createdCategoryIds.push(categoryId);

    const updatedName = `Patch Updated ${Date.now()}`;

    const response = await request(app)
      .patch(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: updatedName,
        description: 'Descripción actualizada',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Categoría actualizada correctamente');
    expect(response.body.data.name).toBe(updatedName);
    expect(response.body.data.description).toBe('Descripción actualizada');
  });

  test('debe devolver 403 si un usuario con rol CLIENT intenta actualizar', async () => {
    const response = await request(app)
      .patch('/api/categories/1')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        description: 'Intento no autorizado',
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('No tienes permisos para realizar esta operación');
  });

  test('debe devolver 404 si la categoría a actualizar no existe', async () => {
    const response = await request(app)
      .patch('/api/categories/99999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        description: 'No existe',
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Categoría no encontrada');
  });

  test('debe devolver 409 si se actualiza con el nombre de otra categoría existente', async () => {
    const fixedName = `Existing Fixed ${Date.now()}`;
    const firstCreate = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: fixedName });

    createdCategoryIds.push(firstCreate.body.data.id);

    const secondName = `Second Fixed ${Date.now()}`;
    const secondCreate = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: secondName });

    const secondId = secondCreate.body.data.id;
    createdCategoryIds.push(secondId);

    const response = await request(app)
      .patch(`/api/categories/${secondId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: fixedName,
      });

    expect(response.statusCode).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Ya existe una categoría con ese nombre');
  });
});

describe('DELETE /api/categories/:id', () => {
  let adminToken;
  let clientToken;

  beforeAll(async () => {
    adminToken = await getAdminToken();
    clientToken = await getClientToken();
  });

  test('debe permitir desactivar una categoría siendo ADMIN (200 / soft delete)', async () => {
    const categoryName = `Delete Active ${Date.now()}`;
    const createRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: categoryName });

    const categoryId = createRes.body.data.id;
    createdCategoryIds.push(categoryId);

    const response = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Categoría desactivada correctamente');
    expect(response.body.data.is_active).toBe(false);
  });

  test('debe devolver 403 si un usuario con rol CLIENT intenta desactivar', async () => {
    const response = await request(app)
      .delete('/api/categories/1')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('No tienes permisos para realizar esta operación');
  });

  test('debe devolver 404 si la categoría a desactivar no existe', async () => {
    const response = await request(app)
      .delete('/api/categories/99999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Categoría no encontrada');
  });

  test('debe devolver 409 si la categoría ya se encuentra inactiva', async () => {
    const categoryName = `Delete Already Inactive ${Date.now()}`;
    const createRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: categoryName });

    const categoryId = createRes.body.data.id;
    createdCategoryIds.push(categoryId);

    // Primera desactivación
    await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Segundo intento sobre la misma categoría
    const response = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('La categoría ya está inactiva');
  });
});