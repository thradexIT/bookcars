import { NextFunction, Request, Response } from 'express'
import * as bookcarsTypes from ':bookcars-types'
import { TransactionalEmailEvent } from '../models/TransactionalEmailDelivery'
import { ReservationStatus } from '../models/ReservationState'
import {
  sendBookingEventEmailNonBlocking,
} from '../services/transactionalEmailService'
import {
  ensureReservationState,
  transitionReservation,
} from '../services/reservationStateService'
import * as logger from '../utils/logger'

const isSuccess = (statusCode: number) => statusCode >= 200 && statusCode < 300

/**
 * Capture the Booking id returned by checkout without changing the inherited
 * checkout response contract. Works for both the normal controller and the
 * idempotent replay middleware.
 */
export const reservationReceivedEmail = (req: Request, res: Response, next: NextFunction) => {
  let emitted = false
  const originalJson = res.json.bind(res)
  const originalSend = res.send.bind(res)

  const emit = (body: any) => {
    if (emitted || !isSuccess(res.statusCode)) return
    const bookingId = body && typeof body === 'object' ? String(body.bookingId || '') : ''
    if (!bookingId) return

    emitted = true
    void ensureReservationState(bookingId, ReservationStatus.Pending)
      .then(() => sendBookingEventEmailNonBlocking({
        bookingId,
        event: TransactionalEmailEvent.ReservationReceived,
      }))
      .catch((err) => logger.error(`[reservationReceivedEmail] Booking ${bookingId}`, err))
  }

  res.json = ((body: any) => {
    emit(body)
    return originalJson(body)
  }) as Response['json']

  res.send = ((body?: any) => {
    emit(body)
    return originalSend(body)
  }) as Response['send']

  next()
}

/**
 * A customer cancellation request is a separate event from an actual cancelled
 * reservation. This email acknowledges intent only and deliberately does not
 * claim that the booking is cancelled.
 */
export const cancellationRequestedEmail = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    if (!isSuccess(res.statusCode)) return
    const bookingId = String(req.params.id || '')
    if (!bookingId) return

    void sendBookingEventEmailNonBlocking({
      bookingId,
      event: TransactionalEmailEvent.CancellationRequested,
    })
  })
  next()
}

const cancelReservationAfterSuccess = async (bookingId: string) => {
  if (!bookingId) return
  try {
    await ensureReservationState(bookingId, ReservationStatus.Pending)
    await transitionReservation(bookingId, ReservationStatus.Cancelled)
    await sendBookingEventEmailNonBlocking({
      bookingId,
      event: TransactionalEmailEvent.ReservationCancelled,
    })
  } catch (err) {
    logger.error(`[reservationCancelledEmail] Booking ${bookingId}`, err)
  }
}

/**
 * Synchronize the explicit MITOS ReservationState and customer cancellation
 * email when the inherited single-booking update sets BookingStatus.Cancelled.
 */
export const reservationCancelledOnUpdate = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    if (!isSuccess(res.statusCode)) return
    const booking = req.body?.booking
    if (booking?.status !== bookcarsTypes.BookingStatus.Cancelled) return
    void cancelReservationAfterSuccess(String(booking._id || ''))
  })
  next()
}

/**
 * Same synchronization for bulk status updates.
 */
export const reservationCancelledOnBulkUpdate = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    if (!isSuccess(res.statusCode)) return
    if (req.body?.status !== bookcarsTypes.BookingStatus.Cancelled) return

    const ids = Array.isArray(req.body?.ids) ? req.body.ids : []
    for (const id of ids) {
      void cancelReservationAfterSuccess(String(id))
    }
  })
  next()
}
