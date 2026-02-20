import React, { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button
} from '@mui/material'
import { Receipt as ReceiptIcon } from '@mui/icons-material'
import * as bookcarsTypes from ':bookcars-types'
import Layout from '@/components/Layout'
import env from '@/config/env.config'
import * as OdooService from '@/services/OdooService'

const PurchaseOrders = () => {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const onLoad = async (user?: bookcarsTypes.User) => {
        if (user && user.type === bookcarsTypes.UserType.Admin) {
            try {
                const _orders = await OdooService.getPurchaseOrders()
                setOrders(_orders)
            } catch (err) {
                console.error('Failed to load purchase orders', err)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDownloadPdf = (id: number) => {
        // Re-use the booking endpoint to generate PDF. We can use the window.open
        // But wait, the backend endpoint for PDF was mapped to bookings:
        // `/api/bookings/purchase-order/:id`. 
        // Wait, the backend endpoint uses booking ID, not Odoo Order ID.
        // If we only have Odoo Order ID here, we need an endpoint to download PDF by Odoo Order ID.
        // Let's create that quickly or adjust.
        window.open(`${env.API_HOST}/api/odoo/purchase-order/${id}/pdf`, '_blank')
    }

    return (
        <Layout onLoad={onLoad} strict>
            <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <h2>Órdenes de Compra</h2>

                {loading ? (
                    <p>Cargando órdenes...</p>
                ) : orders.length === 0 ? (
                    <p>No se encontraron órdenes de compra.</p>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>ID Odoo</strong></TableCell>
                                    <TableCell><strong>Referencia</strong></TableCell>
                                    <TableCell><strong>Proveedor</strong></TableCell>
                                    <TableCell><strong>Fecha</strong></TableCell>
                                    <TableCell><strong>Estado</strong></TableCell>
                                    <TableCell><strong>Total</strong></TableCell>
                                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>{order.name}</TableCell>
                                        <TableCell>{order.partner_id ? order.partner_id[1] : ''}</TableCell>
                                        <TableCell>{order.date_order}</TableCell>
                                        <TableCell>{order.state === 'purchase' ? 'Confirmada' : order.state}</TableCell>
                                        <TableCell>{order.amount_total} PEN</TableCell>
                                        <TableCell align="center">
                                            <Button
                                                variant="contained"
                                                className="btn-primary"
                                                startIcon={<ReceiptIcon />}
                                                onClick={() => handleDownloadPdf(order.id)}
                                                size="small"
                                            >
                                                PDF
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </div>
        </Layout>
    )
}

export default PurchaseOrders
