import swaggerJSDoc from 'swagger-jsdoc'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Recipe API',
    version: '1.0.0',
    description: 'A simple API for managing recipes.'
  }
}

const options = {
  swaggerDefinition,
  apis: ['./src/routes/api/v1/*.js', './swagger.json']
}

const swaggerSpec = swaggerJSDoc(options)
export const swaggerSpecication = swaggerSpec
