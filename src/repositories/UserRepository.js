// Application modules.
import { MongooseRepositoryBase } from './MongooseRepositoryBase.js'
// User-land modules.
import mongoose from 'mongoose'
// Application modules.
import { RepositoryError } from '../lib/errors/RepositoryError.js'
import jwt from 'jsonwebtoken'
const blacklist = new Set()

/**
 *
 */
export class UserRepository extends MongooseRepositoryBase {
  /**
   * Logs in a user.
   *
   * @param {string} username - The username.
   * @param {string} password - The password.
   * @returns {Promise<object>} Promise resolved with the user.
   */
  async login (username, password) {
    try {
      if (!username || !password) {
        throw new mongoose.Error.ValidationError()
      }
      const user = await this.model.authenticate(username, password)
      return user
    } catch (error) {
      throw new RepositoryError({ message: 'Failed to log in user.', cause: error })
    }
  }

  /**
   * Generates a token for a user.
   *
   * @param {object} user - The user.
   * @returns {Promise<string>} Promise resolved with the token.
   */
  async generateToken (user) {
    try {
      if (!user) {
        throw new mongoose.Error.DocumentNotFoundError()
      }
      const payload = {
        id: user.id,
        role: user.role,
        secret: user.secret,
        webhook: user.webhook
      }
      const accessLife = parseInt(process.env.ACCESS_TOKEN_LIFE)
      return jwt.sign(payload, process.env.PRIVATE_KEY, {
        algorithm: 'RS256',
        expiresIn: accessLife
      })
    } catch (error) {
      throw new RepositoryError({ message: 'Failed to generate token.', cause: error })
    }
  }

  /**
   * Creates a webhook secret for a user.
   *
   * @param {string} webhookUrl - The webhook url.
   * @param {string} userId - The user id.
   * @returns {Promise<string>} Promise resolved with the new secret.
   * @throws {RepositoryError} Will throw an error if the webhook failed to create.
   */
  async saveWebhook (webhookUrl, userId) {
    try {
      const updateUser = await this.model.findByIdAndUpdate(
        userId,
        { webhook: webhookUrl },
        { new: true }
      )
      return updateUser
    } catch (error) {
      throw new RepositoryError({ message: 'Failed to save webhook.', cause: error })
    }
  }

  /**
   * Logs out a user.
   *
   * @param {string} userToken - The user token.
   * @returns {Promise<boolean>} Promise resolved with true if the user was logged out.
   */
  async logOut (userToken) {
    try {
    // Kolla om användartoken redan är svartlistad innan du lägger till det
      if (await this.#checkToken(userToken)) {
        blacklist.add(userToken)
      } else {
        // Om användartoken redan är svartlistad, returnera false
        return false
      }
      if (!userToken || userToken === null) {
        throw new mongoose.Error.DocumentNotFoundError()
      }
      return true
    } catch (error) {
      throw new RepositoryError({ message: 'Failed to log out user.', cause: error })
    }
  }

  /**
   * Checks if a token is blacklisted.
   *
   * @param {string} token - The token.
   * @returns {Promise<boolean>} Promise resolved with true if the token is blacklisted.
   */
  async #checkToken (token) {
    if (blacklist.has(token)) {
      return false
    }
    return true
  }
}
