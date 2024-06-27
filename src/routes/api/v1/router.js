/**
 * API version 1 routes.
 *
 * @author Nelly Olofsson
 * @version 2.0.0
 */

import express from 'express'
import { router as userRouter } from './userRouter.js'
import { router as recipeRouter } from './recipeRouter.js'
import { router as swaggerRouter } from './swaggerRouter.js'

export const router = express.Router()

router.get('/', (req, res) => res.json({ message: 'Hooray! Welcome to version 1 of this very simple RESTful API!' }))
router.use('/user', userRouter)
router.use('/', recipeRouter)
router.use('/', swaggerRouter)
