const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth & User API',
      version: '1.0.0',
      description: 'Authentication and user profile endpoints',
    },
    servers: [{ url: 'https://authapip9.onrender.com' }],
  },
  apis: ['./routes/*.js'], // Jahan aap apne route files rakhte hain
};

const swaggerSpec = swaggerJsdoc(options);
options.definition.components = {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    }
  }
};
options.definition.security = [{ bearerAuth: [] }];

module.exports = { swaggerUi, swaggerSpec };
