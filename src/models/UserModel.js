/**
 * Mongoose model User.
 *
 * @author Nelly Olofsson
 * @version 2.0.0
 */
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import validator from 'validator'

import { BASE_SCHEMA } from './baseSchema.js'
import { HttpError } from '../lib/errors/HttpError.js'

const { isEmail } = validator

// Create a schema.
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required.'],
    unique: true,
    trim: true,
    minlength: 1
  },
  password: {
    type: String,
    minLength: 10,
    maxLength: 256,
    required: [true, 'Password is required.'],
    default: false,
    writeOnly: true
  },
  email: {
    type: String,
    maxLength: 254,
    required: [true, 'Email address is required.'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [isEmail, 'Please provide a valid email address.']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  secret: {
    type: String,
    default: ''
  },
  webhook: {
    type: String,
    default: 'default-value'
  }
})

userSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

userSchema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 10)
})

/**
 * Authenticates a user.
 *
 * @param {string} username - The username.
 * @param {string} password - The password.
 * @returns {Promise<object>} Promise resolved with the user.
 */
userSchema.statics.authenticate = async function (username, password) {
  const user = await this.findOne({ username })

  // If no user found or password is wrong, throw an error.
  if (!(await bcrypt.compare(password, user?.password))) {
    throw new HttpError({
      message: 'Invalid credentials',
      status: 400
    })
  }
  // User found and password correct, return the user.
  return user
}

userSchema.add(BASE_SCHEMA)
// Create a model using the schema.
export const UserModel = mongoose.model('User', userSchema)
