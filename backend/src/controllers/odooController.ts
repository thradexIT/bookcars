import { Request, Response } from 'express'
import odooService from '../services/odooService'

export const getPurchaseOrders = async (req: Request, res: Response) => {
    try {
        const orders = await odooService.getPurchaseOrders(100) // fetch up to 100 orders

        // The user requested specifically MECANICA SA orders
        const mecanicaOrders = orders.filter((order) => {
            // partner_id is a tuple like [3, "MECANICA SA"]
            if (order.partner_id && order.partner_id.length > 1) {
                return order.partner_id[1].includes('MECANICA')
            }
            return false
        })

        res.status(200).json(mecanicaOrders)
    } catch (error: any) {
        console.error('Error fetching purchase orders:', error)
        res.status(500).json({ error: error.message })
    }
}

export const downloadPurchaseOrderPdf = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const orderId = Number(id)
        if (isNaN(orderId)) {
            res.status(400).send('Invalid Order ID')
            return
        }

        const pdfBuffer = await odooService.generatePdf(orderId)

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=purchase_order_odoo_${orderId}.pdf`)
        res.send(pdfBuffer)
    } catch (err) {
        console.error(`Error generating PDF for Odoo order ${id}`, err)
        res.status(500).send('Error generating PDF')
    }
}
