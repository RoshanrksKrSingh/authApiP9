const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const options = {
  definition: {
    openapi: '3.0.1',

    info: {
      title: 'Auth & User API',
      version: '1.0.0',
      description: 'Authentication and user profile endpoints',
    },

    servers: [{ url: 'https://authapip9.onrender.com' }],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },

    // Apply to all endpoints globally (you can remove if you only want some protected)
    security: [{ bearerAuth: [] }],
  },

  apis: ['./routes/*.js'], 
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = { swaggerUi, swaggerSpec }
