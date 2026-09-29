import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'OficiosYa API',
    version: '1.0.0',
    description:
      'API REST para la plataforma OficiosYa - Conectando clientes y prestadores de oficios en Jáchal, San Juan.',
    contact: {
      name: 'OficiosYa Dev Team',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de Desarrollo Local',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Introduce el access_token obtenido en /api/auth/login',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js', './src/server.js'],
};

export const swaggerSpec = swaggerJSDoc(options);