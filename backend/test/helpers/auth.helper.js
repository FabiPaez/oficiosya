import request from 'supertest';
import app from '../../src/app.js';

let adminToken = null;
let clientToken = null;

export async function getAdminToken() {
  if (adminToken) return adminToken;

  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Faltan configurar TEST_ADMIN_EMAIL o TEST_ADMIN_PASSWORD en el entorno.');
  }

  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  if (response.statusCode !== 200 || !response.body.data?.session?.access_token) {
    throw new Error(`Error al autenticar ADMIN de prueba: ${response.body.message || response.statusCode}`);
  }

  adminToken = response.body.data.session.access_token;
  return adminToken;
}

export async function getClientToken() {
  if (clientToken) return clientToken;

  const email = process.env.TEST_CLIENT_EMAIL;
  const password = process.env.TEST_CLIENT_PASSWORD;

  if (!email || !password) {
    throw new Error('Faltan configurar TEST_CLIENT_EMAIL o TEST_CLIENT_PASSWORD en el entorno.');
  }

  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  if (response.statusCode !== 200 || !response.body.data?.session?.access_token) {
    throw new Error(`Error al autenticar CLIENT de prueba: ${response.body.message || response.statusCode}`);
  }

  clientToken = response.body.data.session.access_token;
  return clientToken;
}