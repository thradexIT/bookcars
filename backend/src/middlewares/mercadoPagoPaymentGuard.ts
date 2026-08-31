import { NextFunction, Request, Response } from 'express'
import Booking from '../models/Booking'
import PaymentTransaction, {
  PaymentProvider,
  PaymentStatus,
} from '../models/PaymentTransaction'
import * as logger from '../utils/logger'

/**
 * Prevent a reservation from opening a second active Mercado Pago payment with
 * a different idempotency key.
 *
 * Same-key retries continue to the controller, which already performs provider
 * read-back and returns the original transaction. Rejected/failed/refunded
 * attempts are not considered active and therefore do not block a later retry.
 */
const mercadoPagoPaymentGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookingId = String(req.body?.bookingId || '')
    const reservationSessionId = String(req.body?.reservationSessionId || '')
    const idempotencyKey = String(req.headers['x-idempotency-key'] || '').trim()

    // Keep the controller authoritative for malformed requests and its existing
    // 400 contract. The guard only acts once the identifiers it needs exist.
    if (!bookingId || !reservationSessionId || !idempotencyKey) {
      next()
      return
    }

    const booking = await Booking.findById(bookingId).select('_id sessionId')
    if (!booking || !booking.sessionId || booking.sessionId !== reservationSessionId) {
      res.sendStatus(404)
      return
    }

    const activePayment = await PaymentTransaction.findOne({
      booking: booking._id,
      provider: PaymentProvider.MercadoPago,
      idempotencyKey: { $ne: idempotencyKey },
      status: { $in: [PaymentStatus.Pending, PaymentStatus.Approved] },
    }).sort({ _id: -1 })

    if (activePayment) {
      res.status(409).json({
        error: 'Reservation already has an active Mercado Pago payment',
        status: activePayment.status,
      })
      return
    }

    next()
  } catch (err) {
    logger.error('[MercadoPago.paymentGuard] Failed to verify active payment', err)
    // Payment creation is a financial mutation: guard failures fail closed.
    res.status(500).json({ error: 'Unable to verify active payment state' })
  }
}

export default mercadoPagoPaymentGuard
