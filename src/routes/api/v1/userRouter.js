import express from 'express'
// Application modules.
import { container, USERTYPES } from '../../../config/inversify.config.js'
import jwt from 'jsonwebtoken'
import { HttpError } from '../../../lib/errors/HttpError.js'

export const router = express.Router()

/**
 * Authenticate a JWT token.
 *
 * @returns {Function} A middleware function.
 */
const authenticateJWT = () => (req, res, next) => {
  try {
    const [authenticationScheme, token] = req.headers.authorization?.split(' ')
    if (authenticationScheme !== 'Bearer') {
      throw new HttpError({ message: 'Invalid authentication scheme.', status: 401 })
    }
    const payload = jwt.verify(token, process.env.PUBLIC_KEY)
    req.user = {
      id: payload.id,
      role: payload.role,
      secret: payload.secret
    }
    next()
  } catch (err) {
    throw new HttpError({
      cause: err,
      message: 'Unauthorized',
      status: 403
    })
  }
}

router.route('/login')
  .post((req, res, next) => {
    container.get(USERTYPES.UserController).login(req, res, next)
  })

router.route('/register')
  .post((req, res, next) => {
    container.get(USERTYPES.UserController).register(req, res, next)
  })

router.route('/logout')
  .post(authenticateJWT(), (req, res, next) => {
    container.get(USERTYPES.UserController).logOut(req, res, next)
  })

router.route('/webhook')
  .post(authenticateJWT(), (req, res, next) => {
    container.get(USERTYPES.UserController).webhookRegister(req, res, next)
  })
