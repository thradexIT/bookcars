import express from 'express'
import routeNames from '../config/clientTypeRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as clientTypeController from '../controllers/clientTypeController'

const routes = express.Router()

routes.route(routeNames.getClientTypes).get(authJwt.verifyToken, clientTypeController.getClientTypes)
routes.route(routeNames.getClientType).get(authJwt.verifyToken, clientTypeController.getClientType)
routes.route(routeNames.create).post(authJwt.verifyToken, clientTypeController.create)
routes.route(routeNames.update).put(authJwt.verifyToken, clientTypeController.update)
routes.route(routeNames.delete).post(authJwt.verifyToken, clientTypeController.deleteClientTypes)

export default routes
