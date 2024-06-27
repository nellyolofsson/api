/**
 * Fetches a recipes from the API.
 *
 * @returns {Promise<Response>} The response object.
 */
export const fetchRecipe = async () => {
  const keywords = ['muffin'] // lägg till flera ke
  const batchSize = 10
  const recipes = []
  try {
    for (const keyword of keywords) {
      const response = await fetch(`https://api.api-ninjas.com/v1/recipe?query=${keyword}&offset=0`, {
        method: 'GET',
        headers: {
          'X-Api-Key': 'n3nFipFTRL25VhEZCIP/Vg==XvLiIoNGkI2cfOmR',
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        const errorMessage = await response.text()
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorMessage}`)
      }
      const jsonResponse = await response.json()
      const fetchedRecipes = jsonResponse
      if (fetchedRecipes.length === 0) {
        // No recipes found for the current keyword
        continue
      }
      // Add fetched recipes to the recipes array
      recipes.push(...fetchedRecipes.slice(0, batchSize))
      // Check if we have fetched enough recipes
      if (recipes.length >= 100) {
        break
      }
    }
    console.log(`Fetched ${recipes.length} recipes in total.`)
    return recipes
  } catch (error) {
    console.error('Error fetching recipes:', error)
    throw error
  }
}

/**
 * Function to categorize recipes based on their titles.
 *
 * @param {object[]} recipes - The recipes to categorize.
 * @returns {object[]} The categorized recipes.
 */
export const categorizeRecipes = (recipes) => {
  // Define categories and their corresponding keywords or patterns
  const categories = {
    Seafood: ['salmon', 'fish', 'shrimp', 'seafood', 'gravlax'],
    Vegetarian: ['vegetarian', 'vegan', 'tofu', 'plant-based'],
    Dessert: ['cake', 'dessert', 'sweet', 'chocolate', 'muffin'],
    Breakfast: ['breakfast', 'pancake', 'waffle', 'brunch'],
    Pasta: ['pasta', 'spaghetti', 'lasagna', 'noodle'],
    Chicken: ['chicken', 'poultry', 'turkey', 'duck'],
    Beef: ['beef', 'steak', 'burger', 'meatball'],
    Pork: ['pork', 'bacon', 'ham', 'sausage'],
    Soup: ['soup', 'stew', 'chowder', 'bisque']
    // Add more categories and keywords as needed
  }

  // Iterate through each recipe and assign a category
  recipes.forEach(recipe => {
    const title = recipe.title.toLowerCase()

    // Check if the title contains any keywords for each category
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => title.includes(keyword))) {
        // Assign the first matching category found
        recipe.category = category
        break
      }
    }

    // If no matching category is found, assign a default category
    if (!recipe.category) {
      recipe.category = 'Uncategorized'
    }
  })

  return recipes
}
