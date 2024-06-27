import express from 'express'
import jwt from 'jsonwebtoken'
import {
  HttpError
} from '../../../lib/errors/index.js'

// Application modules.
import { container, RECIPETYPES } from '../../../config/inversify.config.js'

export const router = express.Router()

/**
 * Middleware to authenticate a user using a JSON Web Token.
 *
 * @param {string} requiredRole The required role to access the route.
 * @returns {Function} A middleware function.
 * @throws {Error} If the authentication scheme is invalid.
 */
const authenticateJWT = (requiredRole) => (req, res, next) => {
  try {
    const [authenticationScheme, token] = req.headers.authorization?.split(' ')
    if (authenticationScheme !== 'Bearer') {
      throw new HttpError('Invalid authentication scheme.')
    }
    const payload = jwt.verify(token, process.env.PUBLIC_KEY)
    req.user = {
      id: payload.id,
      role: payload.role,
      secret: payload.secret,
      webhook: payload.webhook
    }
    if (!req.user.role || !hasPermission(req.user.role, requiredRole)) {
      throw new HttpError('Unauthorized')
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

/**
 * Check if a user has permission to access a route.
 *
 * @param {string} userRole The role of the user.
 * @param {string[]} requiredRoles The required roles to access the route.
 * @returns {boolean} True if the user has permission, otherwise false.
 */
const hasPermission = (userRole, requiredRoles) => {
  if (requiredRoles.includes(userRole)) {
    return true
  } else {
    return false
  }
}

// Provide req.doc to the route if :id is present in the route path.
router.param('id', (req, res, next, id) =>
  container.get(RECIPETYPES.RecipeController).loadRecipeDocument(req, res, next, id))

// Map HTTP verbs and route paths to controller actions.
router.route('/recipe')
  .post(authenticateJWT('admin'), (req, res, next) => container.get(RECIPETYPES.RecipeController).createRecipe(req, res, next))

router.route('/recipe/:id')
  .put(authenticateJWT('admin'), (req, res, next) => container.get(RECIPETYPES.RecipeController).replaceRecipe(req, res, next))
  .patch(authenticateJWT('admin'), (req, res, next) => container.get(RECIPETYPES.RecipeController).updateRecipe(req, res, next))
  .delete(authenticateJWT('admin'), (req, res, next) => container.get(RECIPETYPES.RecipeController).deleteRecipe(req, res, next))

router.route('/recipe/:id')
  .get(authenticateJWT(['admin', 'user']), (req, res, next) => container.get(RECIPETYPES.RecipeController).find(req, res, next))

router.route('/recipes')
  .get(authenticateJWT(['admin', 'user']), (req, res, next) => container.get(RECIPETYPES.RecipeController).findAllRecipes(req, res, next))

router.route('/recipes/:search')
  .post(authenticateJWT(['admin', 'user']), (req, res, next) => container.get(RECIPETYPES.RecipeController).searchRecipe(req, res, next))
