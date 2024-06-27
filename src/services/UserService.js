// Application modules.
import { MongooseServiceBase } from './MongooseServiceBase.js'
/**
 *
 */
export class UserService extends MongooseServiceBase {
  /**
   * Logs in a user.
   *
   * @param {string} username - The username.
   * @param {string} password - The password.
   * @returns {Promise<object>} Promise resolved with the logged in user.
   */
  async login (username, password) {
    try {
      const repositories = this.getRepository()
      return await repositories.login(username, password)
    } catch (error) {
      this.getHandleError(error, 'Failed to log in user.')
    }
  }

  /**
   * Generates a token.
   *
   * @param {object} user - The user to generate a token for.
   * @returns {Promise<string>} Promise resolved with the generated token.
   */
  async generateToken (user) {
    try {
      const repositories = this.getRepository()
      return await repositories.generateToken(user)
    } catch (error) {
      this.getHandleError(error, 'Failed to generate token.')
    }
  }

  /**
   * Creates a webhook.
   *
   * @param {object} user - The user to create the webhook for.
   * @returns {Promise<object>} Promise resolved with the created webhook.
   */
  async createWebhook (user) {
    try {
      const repositories = this.getRepository()
      return await repositories.createWebhook(user)
    } catch (error) {
      this.getHandleError(error, 'Failed to create webhook.')
    }
  }

  /**
   * Saves a webhook to the user doc.
   *
   * @param {object} webhook - The webhook to save.
   * @param {string} userId - The user id.
   * @returns {Promise<object>} Promise resolved with the saved webhook.
   */
  async saveWebhook (webhook, userId) {
    try {
      const repositories = this.getRepository()
      return await repositories.saveWebhook(webhook, userId)
    } catch (error) {
      this.getHandleError(error, 'Failed to save webhook')
    }
  }

  /**
   * Logs out a user.
   *
   * @param {string} userToken - The user token.
   * @returns {Promise<object>} Promise resolved with the logged out user.
   */
  async logOut (userToken) {
    try {
      const repositories = this.getRepository()
      return await repositories.logOut(userToken)
    } catch (error) {
      this.getHandleError(error, 'Failed to log out user.')
    }
  }
}
