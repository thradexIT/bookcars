import * as bookcarsTypes from ':bookcars-types'
import axiosInstance from './axiosInstance'
import * as UserService from './UserService'

/**
 * Get bookings
 *
 * @param {bookcarsTypes.GetBookingsPayload} payload
 * @param {number} page
 * @param {number} size
 * @returns {Promise<bookcarsTypes.Result<bookcarsTypes.Booking>>}
 */
export const getBookings = (payload: bookcarsTypes.GetBookingsPayload, page: number, size: number): Promise<bookcarsTypes.Result<bookcarsTypes.Booking>> =>
  axiosInstance
    .post(
      `/api/bookings/${page}/${size}/${UserService.getLanguage()}`,
      payload,
      { withCredentials: true }
    )
    .then((res) => res.data)

/**
 * Get booking
 *
 * @param {string} id
 * @returns {Promise<bookcarsTypes.Booking>}
 */
export const getBooking = (id: string): Promise<bookcarsTypes.Booking> =>
  axiosInstance
    .get(
      `/api/booking/${encodeURIComponent(id)}/${UserService.getLanguage()}`,
      { withCredentials: true }
    )
    .then((res) => res.data)

/**
 * Get booking by session ID
 *
 * @param {string} sessionId
 * @returns {Promise<bookcarsTypes.Booking>}
 */
export const getBookingId = (sessionId: string): Promise<bookcarsTypes.Booking> =>
  axiosInstance
    .get(
      `/api/booking-id/${encodeURIComponent(sessionId)}`,
      { withCredentials: true }
    )
    .then((res) => res.data)

/**
 * Has bookings
 *
 * @param {string} driver
 * @returns {Promise<number>}
 */
export const hasBookings = (driver: string): Promise<number> =>
  axiosInstance
    .get(
      `/api/has-bookings/${encodeURIComponent(driver)}`,
      { withCredentials: true }
    )
    .then((res) => res.data)

/**
 * Update booking
 *
 * @param {bookcarsTypes.UpsertBookingPayload} data
 * @returns {Promise<number>}
 */
export const update = (data: bookcarsTypes.UpsertBookingPayload): Promise<number> =>
  axiosInstance
    .put(
      '/api/update-booking',
      data,
      { withCredentials: true }
    )
    .then((res) => res.status)

/**
 * Update booking status
 *
 * @param {bookcarsTypes.UpdateStatusPayload} payload
 * @returns {Promise<number>}
 */
export const updateStatus = (payload: bookcarsTypes.UpdateStatusPayload): Promise<number> =>
  axiosInstance
    .post(
      '/api/update-booking-status',
      payload,
      { withCredentials: true }
    )
    .then((res) => res.status)

/**
 * Delete bookings
 *
 * @param {string[]} ids
 * @returns {Promise<number>}
 */
export const deleteBookings = (ids: string[]): Promise<number> =>
  axiosInstance
    .post(
      '/api/delete-bookings',
      ids,
      { withCredentials: true }
    )
    .then((res) => res.status)

/**
 * Cancel booking
 *
 * @param {string} id
 * @returns {Promise<number>}
 */
export const cancel = (id: string): Promise<number> =>
  axiosInstance
    .post(
      `/api/cancel-booking/${encodeURIComponent(id)}`,
      null,
      { withCredentials: true }
    )
    .then((res) => res.status)

/**
 * Checkout departure
 *
 * @param {string} id
 * @param {FormData} payload
 * @returns {Promise<bookcarsTypes.Booking>}
 */
export const checkoutDeparture = (id: string, payload: FormData): Promise<bookcarsTypes.Booking> =>
  axiosInstance
    .post(
      `/api/checkout-departure/${encodeURIComponent(id)}`,
      payload,
      {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
    .then((res) => res.data)

/**
 * Checkin return
 *
 * @param {string} id
 * @param {FormData} payload
 * @returns {Promise<bookcarsTypes.Booking>}
 */
export const checkinReturn = (id: string, payload: FormData): Promise<bookcarsTypes.Booking> =>
  axiosInstance
    .post(
      `/api/checkin-return/${encodeURIComponent(id)}`,
      payload,
      {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
    .then((res) => res.data)

/**
 * Save digital signatures for a booking.
 *
 * @param {string} id
 * @param {{ signatureDriver?: string; signatureRep?: string; signatureDriverIn?: string; signatureRepIn?: string }} payload
 * @returns {Promise<{ ok: boolean }>}
 */
export const saveSignatures = (id: string, payload: { 
  signatureDriver?: string; signatureRep?: string;
  signatureDriverIn?: string; signatureRepIn?: string;
}): Promise<{ ok: boolean }> =>
  axiosInstance
    .patch(
      `/api/booking-signatures/${encodeURIComponent(id)}`,
      payload,
      { withCredentials: true }
    )
    .then((res) => res.data)

/**
 * Verify inspection
 *
 * @param {string} id
 * @param {{ picturesOutVerified?: boolean; picturesInVerified?: boolean; verificationRemarks?: string }} payload
 * @returns {Promise<bookcarsTypes.Booking>}
 */
export const verifyInspection = (
  id: string,
  payload: { picturesOutVerified?: boolean; picturesInVerified?: boolean; verificationRemarks?: string }
): Promise<bookcarsTypes.Booking> =>
  axiosInstance
    .post(
      `/api/verify-inspection/${encodeURIComponent(id)}`,
      payload,
      { withCredentials: true }
    )
    .then((res) => res.data)
