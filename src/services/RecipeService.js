import { MongooseServiceBase } from './MongooseServiceBase.js'
/**
 *
 */
export class RecipeService extends MongooseServiceBase {
  /**
   * The search term.
   *
   * @param {string} search - The search term.
   * @returns {Promise<object>} Promise resolved with the search term.
   */
  async searchTerm (search) {
    try {
      const repositories = this.getRepository()
      return await repositories.searchTerm(search)
    } catch (error) {
      this.getHandleError(error, 'Failed to search for term.')
    }
  }

  /**
   * Sends a webhook.
   *
   * @param {object} webhook - The webhook to send.
   * @param {object} webhookSecret - The webhook secret.
   * @param {object} webhookUrl - The webhook URL.
   * @returns {Promise<object>} Promise resolved with the sent webhook.
   */
  async sendWebhook (webhook, webhookSecret, webhookUrl) {
    try {
      const repositories = this.getRepository()
      return await repositories.sendWebhook(webhook, webhookSecret, webhookUrl)
    } catch (error) {
      this.getHandleError(error, 'Failed to send webhook.')
    }
  }
}
