import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpecication } from '../../../config/swagger.js'

export const router = express.Router()

router.use('/api-docs', swaggerUi.serve)
router.get('/api-docs', swaggerUi.setup(swaggerSpecication))
