import axios from 'axios'
import * as bookcarsTypes from ':bookcars-types'

export const createPayment = (payload: bookcarsTypes.CreatePaymentPayload & { token: string, installments: number, paymentMethodId: string, issuerId?: string, payer: any }): Promise<{ status: string, id: number | string, qr_code_base64?: string, external_resource_url?: string }> =>
    axios.post(
        '/api/create-mercadopago-payment',
        payload
    ).then((res) => res.data)
