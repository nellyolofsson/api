// Application modules.
import { MongooseRepositoryBase } from './MongooseRepositoryBase.js'
import { RepositoryError } from '../lib/errors/RepositoryError.js'

/**
 *
 */
export class RecipeRepository extends MongooseRepositoryBase {
  /**
   * Searches for a recipe.
   *
   * @param {string} search - The search term.
   * @returns {Promise<object>} Promise resolved with the found documents.
   */
  async searchTerm (search) {
    try {
      const documents = await this.model.find({
        $or: [
          { title: { $regex: search, $options: 'i' } }, // Case-insensitive search for title
          { category: { $regex: search, $options: 'i' } } // Case-insensitive search for category
        ]
      })
      return documents
    } catch (error) {
      throw new RepositoryError({ message: 'Failed to search for term.', cause: error })
    }
  }

  /**
   * Sends a webhook.
   *
   * @param {object} webhook - The webhook.
   * @param {string} webhookSecret - The webhook secret.
   * @param {string} webhookUrl - The webhook url.
   * @returns {Promise<object>} Promise resolved with the response.
   */
  async sendWebhook (webhook, webhookSecret, webhookUrl) {
    try {
      const payload = {
        ...webhook,
        secret: webhookSecret,
        webhook: webhookUrl
      }
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      return response
    } catch (error) {
      throw new RepositoryError({ message: 'Failed to send webhook.', cause: error })
    }
  }
}
