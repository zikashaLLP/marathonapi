const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Marathon Registration API',
      version: '1.0.0',
      description: 'A comprehensive API for Marathon registration system with OTP authentication, payment integration, and admin management',
      contact: {
        name: 'API Support',
        email: 'support@marathon.com'
      }
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        },
        basicAuth: {
          type: 'http',
          scheme: 'basic',
          description: 'Admin credentials (mobile:password)'
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'OTP-based authentication endpoints'
      },
      {
        name: 'Participant',
        description: 'Participant registration and management'
      },
      {
        name: 'Marathon',
        description: 'Marathon CRUD operations'
      },
      {
        name: 'Payment',
        description: 'Payment integration with PhonePe'
      },
      {
        name: 'Admin',
        description: 'Admin-only endpoints for user and report management'
      },
      {
        name: 'Result',
        description: 'Marathon result upload and management'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

