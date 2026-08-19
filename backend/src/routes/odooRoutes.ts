import express from 'express'
import authJwt from '../middlewares/authJwt'
import * as odooController from '../controllers/odooController'

const routes = express.Router()

routes.route('/api/odoo/purchase-orders').get(authJwt.verifyToken, odooController.getPurchaseOrders)
routes.route('/api/odoo/purchase-order/:id/pdf').get(odooController.downloadPurchaseOrderPdf)

export default routes
