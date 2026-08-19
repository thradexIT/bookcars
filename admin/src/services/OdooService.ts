import axiosInstance from './axiosInstance'

/**
 * Get MECANICA SA Purchase Orders.
 *
 * @returns {Promise<any[]>}
 */
export const getPurchaseOrders = (): Promise<any[]> =>
    axiosInstance
        .get(
            '/api/odoo/purchase-orders',
            { withCredentials: true }
        )
        .then((res) => res.data)
