import { UserService } from '../services/UserService.js'
import { logger } from '../config/winston.js'
import { convertToHttpError } from '../lib/util.js'
/**
 *
 */
export class UserController {
  /**
   * @type {UserService}
   */
  #userService
  /**
   * Creates an instance of UserController.
   *
   * @param {UserService} userservice - The user service.
   */
  constructor (userservice) {
    logger.silly('UserController constructor')
    this.#userService = userservice
  }

  /**
   * Logs in a user.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {Function} next - The next function.
   * @returns {Promise<void>} A promise that resolves with the logged in user.
   */
  async login (req, res, next) {
    try {
      const username = req.body.username
      const password = req.body.password
      const user = await this.#userService.login(username, password)
      const token = await this.#userService.generateToken(user)
      res
        .status(201)
        .json({
          access_token: token
        })
    } catch (error) {
      next(convertToHttpError(error))
    }
  }

  /**
   * Registers a webhook for a user.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {Function} next - The next function.
   */
  async webhookRegister (req, res, next) {
    try {
      const currentId = req.body.id
      const webhookUrl = req.body.webhook
      await this.#userService.saveWebhook(webhookUrl, currentId)
      const currentUser = await this.#userService.getById(currentId)
      const webhookSecret = currentUser.secret
      res.status(201).json({ message: 'Webhook registered successfully', webhookSecret })
    } catch (error) {
      next(convertToHttpError(error))
    }
  }

  /**
   * Registers a new user.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {Function} next - The next function.
   */
  async register (req, res, next) {
    try {
      const currentUser = req.body
      const user = await this.#userService.insert(currentUser)
      const secret = await this.#userService.createWebhook(user)
      const loginUrl = `${req.protocol}://${req.get('host')}/api/v1/user/login`
      const method = 'POST'
      res.status(201).json({ id: user.id, webhook_secret: secret, message: 'User created.', links: [{ href: loginUrl, method: method }] })
    } catch (error) {
      next(convertToHttpError(error))
    }
  }

  /**
   * Logs out a user.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {Function} next - The next function.
   */
  async logOut (req, res, next) {
    try {
      const userToken = req.headers.authorization.split(' ')[1]
      await this.#userService.logOut(userToken) // Logga ut användaren baserat på JWT-token
      const logoutUrl = `${req.protocol}://${req.get('host')}/api/v1/user/login`
      const method = 'POST'
      res.status(200).json({ message: 'You have log out!', links: [{ href: logoutUrl, method: method }] }).end()
    } catch (error) {
      next(convertToHttpError(error))
    }
  }
}
