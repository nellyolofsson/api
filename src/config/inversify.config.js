// User-land modules.
import { Container, decorate, inject, injectable } from 'inversify'
import 'reflect-metadata'

// Application modules.
import { UserController } from '../controllers/UserController.js'
import { UserModel } from '../models/UserModel.js'
import { MongooseRepositoryBase } from '../repositories/MongooseRepositoryBase.js'
import { UserRepository } from '../repositories/UserRepository.js'
import { MongooseServiceBase } from '../services/MongooseServiceBase.js'
import { UserService } from '../services/UserService.js'

// Application modules.
import { RecipeController } from '../controllers/RecipeController.js'
import { RecipeModel } from '../models/RecipeModel.js'
import { RecipeRepository } from '../repositories/RecipeRespository.js'
import { RecipeService } from '../services/RecipeService.js'

// Define the types to be used by the IoC container.
export const USERTYPES = {
  UserController: Symbol.for('UserController'),
  UserRepository: Symbol.for('UserRepository'),
  UserService: Symbol.for('UserService'),
  UserModelClass: Symbol.for('UserModelClass')
}

// Define the types to be used by the IoC container.
export const RECIPETYPES = {
  RecipeController: Symbol.for('RecipeController'),
  RecipeRepository: Symbol.for('RecipeRepository'),
  RecipeService: Symbol.for('RecipeService'),
  RecipeModelClass: Symbol.for('RecipeModelClass')
}

// Declare the injectable and its dependencies.
decorate(injectable(), MongooseRepositoryBase)
decorate(injectable(), MongooseServiceBase)
decorate(injectable(), UserRepository)
decorate(injectable(), UserService)
decorate(injectable(), UserController)

decorate(injectable(), RecipeRepository)
decorate(injectable(), RecipeService)
decorate(injectable(), RecipeController)

decorate(inject(USERTYPES.UserService), UserController, 0)
decorate(inject(USERTYPES.UserModelClass), UserRepository, 0)

decorate(inject(RECIPETYPES.RecipeService), RecipeController, 0)
decorate(inject(RECIPETYPES.RecipeModelClass), RecipeRepository, 0)

decorate(inject(USERTYPES.UserRepository), UserService, 0)
decorate(inject(RECIPETYPES.RecipeRepository), RecipeService, 0)

// Create the IoC container.
export const container = new Container()
// Declare the bindings.
container.bind(RECIPETYPES.RecipeController).to(RecipeController).inSingletonScope()
container.bind(RECIPETYPES.RecipeRepository).to(RecipeRepository).inSingletonScope()
container.bind(RECIPETYPES.RecipeService).to(RecipeService).inSingletonScope()
container.bind(RECIPETYPES.RecipeModelClass).toConstantValue(RecipeModel)
container.bind(USERTYPES.UserController).to(UserController).inSingletonScope()
container.bind(USERTYPES.UserRepository).to(UserRepository).inSingletonScope()
container.bind(USERTYPES.UserService).to(UserService).inSingletonScope()
container.bind(USERTYPES.UserModelClass).toConstantValue(UserModel)
