import mongoose from 'mongoose'

import { BASE_SCHEMA } from './baseSchema.js'

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required.'],
    unique: true,
    trim: true,
    minlength: 1
  },
  ingredients: {
    type: [String],
    required: [true, 'Ingredients are required.'],
    trim: true,
    minlength: 1
  },
  servings: {
    type: String,
    required: [true, 'Servings are required.'],
    min: 1
  },
  instructions: {
    type: [String],
    required: [true, 'Instructions are required.'],
    trim: true,
    minlength: 1
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  imageUrl: {
    type: String,
    required: false
  }
})

recipeSchema.add(BASE_SCHEMA)

export const RecipeModel = mongoose.model('Recipe', recipeSchema)
