import { convertToHttpError } from '../lib/util.js'
import { RecipeService } from '../services/RecipeService.js'
import { logger } from '../config/winston.js'

/**
 *
 */
export class RecipeController {
  /**
   * @param {RecipeService}
   */
  #recipeService
  /**
   * Creates an instance of RecipeController.
   *
   * @param {RecipeService} recipeservice - The recipe service.
   */
  constructor (recipeservice) {
    logger.silly('RecipeController constructor')
    this.#recipeService = recipeservice
  }

  /**
   * Loads a recipe document.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {Function} next - The next middleware function.
   * @param {string} id - The recipe ID.
   */
  async loadRecipeDocument (req, res, next, id) {
    try {
      req.doc = await this.#recipeService.getById(id)
      next()
    } catch (error) {
      next(convertToHttpError(error))
    }
  }

  /**
   * Finds all recipe documents.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  async findAllRecipes (req, res, next) {
    try {
      // Get the page and per_page query parameters (get the first page
      // with 20 documents per page if not specified).
      const page = Number(req.query?.page) || 1
      const perPage = Number(req.query?.per_page) || 20
      const recipes = await this.#recipeService.get({ page, perPage })

      // set pagination headers
      this.#setPaginationHeaders(req, res, recipes.pagination)
      // Skapa en kopia av receptdata där varje recept har en länk
      const recipesWithLinks = recipes.data.map(recipe => ({
        ...recipe.toObject(),
        links: {
          self: `${req.protocol}://${req.get('host')}/api/v1/recipe/${recipe.id}` // Länk till det enskilda receptet
        }
      }))
      if (recipes.data.length > 0) {
        res.json(recipesWithLinks) // Fix: Pass an object with both data and links properties
      } else {
        res.status(204).json()
      }
    } catch (error) {
      next(convertToHttpError(error))
    }
  }

  /**
   * Creates a recipe document.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  async createRecipe (req, res, next) {
    try {
      const recipeToCreate = req.body
      const recipe = await this.#recipeService.insert(recipeToCreate)
      const user = req.user
      const webhookSecret = user.secret
      const webhookUrl = user.webhook

      const webHookPayload = {
        recipeId: recipe.id,
        title: recipe.title,
        servings: recipe.servings,
        category: recipe.category,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions
      }
      // Send the webhook payload to the webhook URL
      await this.#recipeService.sendWebhook(webHookPayload, webhookSecret, webhookUrl)
      // Add link to the created recipe
      const createdRecipeWithLink = {
        ...recipe.toObject(),
        links: {
          self: `${req.protocol}://${req.get('host')}/api/v1/recipe/${recipe.id}` // Link to the newly created recipe
        }
      }
      res.status(201).json(createdRecipeWithLink)
    } catch (error) {
      next(convertToHttpError(error))
    }
  }

  /**
   * Sends a JSON response containing a recipe.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async find (req, res, next) {
    try {
      const recipe = req.doc
      const recipeWithLink = {
        ...recipe.toObject(),
        links: {
          self: `${req.protocol}://${req.get('host')}/api/v1/recipe/${recipe.id}`
        }
      }
      res.json(recipeWithLink)
    } catch (error) {
      next(convertToHttpError(error))
    }
  }

  /**
   * Updates a recipe document partially.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} Promise resolved with the updated recipe.
   */
  async updateRecipe (req, res, next) {
    try {
      const recipe = req.doc
      const updateData = req.body // Contains only the fields that need to be updated
      if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Request body cannot be empty.' })
      }
      await this.#recipeService.updateOrReplace(recipe, updateData, false) // Pass false to indicate partial update
      // Lägg till en länk till det uppdaterade receptet i svaret
      const updatedRecipeWithLink = {
        ...recipe.toObject(),
        ...updateData,
        links: {
          self: `${req.protocol}://${req.get('host')}/api/v1/recipe/${recipe.id}`
        }
      }
      res.status(200).json(updatedRecipeWithLink)
    } catch (error) {
      next(convertToHttpError(error))
    }
  }

  /**
   * Replaces a recipe document.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} Promise resolved with the replaced recipe.
   */
  async replaceRecipe (req, res, next) {
    try {
      const recipe = req.doc
      // Check if the request body is empty
      if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Request body cannot be empty.' })
      }
      await this.#recipeService.updateOrReplace(recipe, req.body, true) // Pass true to indicate replacement
      const replacedRecipeWithLink = {
        ...recipe.toObject(),
        ...req.body,
        links: {
          self: `${req.protocol}://${req.get('host')}/api/v1/recipe/${recipe.id}`
        }
      }
      res.status(200).json(replacedRecipeWithLink)
    } catch (error) {
      next(convertToHttpError(error))
    }
  }

  /**
   * Deletes a recipe document.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  async deleteRecipe (req, res, next) {
    try {
      const recipe = req.doc
      await this.#recipeService.delete(recipe)
      res.status(204).end()
    } catch (error) {
      next(convertToHttpError(error))
    }
  }

  /**
   * Searches for recipes.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} Promise resolved with the search results.
   */
  async searchRecipe (req, res, next) {
    try {
      const searchTerm = req.body.searchTerm // Anta att söktermen kommer som 'searchTerm' i request body
      if (!searchTerm) {
        return res.status(400).json({ message: 'Search term not provided.' })
      }
      // Skapa en regex för att matcha delvis med söktermen
      const regex = new RegExp(searchTerm)
      // Sök efter recept där titeln eller kategorin delvis matchar den angivna söktermen
      const recipes = await this.#recipeService.searchTerm(regex)
      if (recipes.length === 0) {
        return res.status(404).json({ message: 'No recipes found matching the search term.' })
      }
      const recipesWithLinks = recipes.map(recipe => ({
        ...recipe.toObject(),
        links: {
          self: `${req.protocol}://${req.get('host')}/api/v1/recipe/${recipe.id}` // Länk till det enskilda receptet
        }
      }))
      res.json(recipesWithLinks)
    } catch (error) {
      next(convertToHttpError(error))
    }
  }

  /**
   * Sets the pagination headers.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {object} pagination - The pagination data.
   * @param {number} pagination.totalCount - The total number of documents.
   * @param {number} pagination.page - The current page.
   * @param {number} pagination.perPage - The number of documents per page.
   * @param {number} pagination.totalPages - The total number of pages.
   */
  #setPaginationHeaders (req, res, { totalCount, page, perPage, totalPages }) {
    // Set pagination headers.
    res.set('X-Total-Count', totalCount)
    res.set('X-Page', page)
    res.set('X-Per-Page', perPage)
    res.set('X-Total-Pages', totalPages)

    // Generate and set link header.
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`
    let linkHeader = ''

    // Next page.
    if (page < totalPages) {
      linkHeader += `<${baseUrl}?page=${page + 1}&per_page=${perPage}>; rel="next", `
    }

    // Previous page.
    if (page > 1) {
      linkHeader += `<${baseUrl}?page=${page - 1}&per_page=${perPage}>; rel="prev", `
    }

    // First and last page.
    linkHeader += `<${baseUrl}?page=1&per_page=${perPage}>; rel="first", `
    linkHeader += `<${baseUrl}?page=${totalPages}&per_page=${perPage}>; rel="last"`

    res.set('Link', linkHeader)
  }
}
