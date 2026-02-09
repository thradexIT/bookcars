import express from 'express'
import routeNames from '../config/mercadoPagoRoutes.config'
import * as mercadoPagoController from '../controllers/mercadoPagoController'

const routes = express.Router()

routes.route(routeNames.createPayment).post(mercadoPagoController.createPayment)

export default routes
