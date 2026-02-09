import { Request, Response } from 'express'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import * as env from '../config/env.config'
import * as bookcarsTypes from ':bookcars-types'
import i18n from '../lang/i18n'

const client = new MercadoPagoConfig({ accessToken: env.MERCADO_PAGO_ACCESS_TOKEN })
const payment = new Payment(client)

/**
 * Create a Mercado Pago payment.
 *
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const createPayment = async (req: Request, res: Response) => {
    try {
        const { body }: { body: bookcarsTypes.CreatePaymentPayload & { token: string, installments: number, paymentMethodId: string, issuerId: string, payer: any } } = req
        if (!body.amount || !body.paymentMethodId || !body.token || !body.payer?.email) {
            return res.status(400).json({ error: i18n.t('ERROR') })
        }

        const payerEmail = body.payer.email

        let paymentData: any = {
            transaction_amount: Number(body.amount),
            description: body.description || 'BookCars Payment',
            payment_method_id: body.paymentMethodId,
            payer: {
                email: payerEmail,
            },
        }

        if (body.paymentMethodId === 'yape') {
            paymentData = {
                ...paymentData,
                token: body.token,
                installments: 1,
            }
        } else {
            paymentData = {
                ...paymentData,
                token: body.token,
                installments: Number(body.installments),
                issuer_id: body.issuerId,
                payer: {
                    ...paymentData.payer,
                    identification: {
                        type: body.payer.identification?.docType,
                        number: body.payer.identification?.docNumber,
                    },
                },
            }
        }

        const data = await payment.create({ body: paymentData })

        const responseData: any = {
            status: data.status,
            id: data.id,
        }

        if (data.point_of_interaction?.transaction_data) {
            responseData.qr_code_base64 = data.point_of_interaction.transaction_data.qr_code_base64
            responseData.qr_code = data.point_of_interaction.transaction_data.qr_code
        }

        if (data.transaction_details?.external_resource_url) {
            responseData.external_resource_url = data.transaction_details.external_resource_url
        }

        return res.status(201).json(responseData)
    } catch (err) {
        console.error(`[MercadoPago.createPayment] ${i18n.t('ERROR')}`, err)
        return res.status(400).json({ error: i18n.t('ERROR') })
    }
}
