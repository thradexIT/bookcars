import axiosInstance from './axiosInstance'
import * as UserService from './UserService'

export interface BookingFilter {
  keyword?: string        // Plate or driver name search
  statuses?: string[]     // ['paid', 'reserved', 'paidInFull', 'deposit']
  from?: string           // ISO date – filter pickup date
  to?: string             // ISO date – filter dropoff date
}

export type BookingStatus =
  | 'void'
  | 'pending'
  | 'deposit'
  | 'paid'
  | 'paidInFull'
  | 'reserved'
  | 'cancelled'

export interface Car {
  _id: string
  name: string
  licensePlate?: string
  image?: string
}

export interface Driver {
  _id: string
  fullName: string
  phone?: string
  email?: string
}

export interface Location {
  _id: string
  name?: string
}

export interface Booking {
  _id: string
  car: Car
  driver: Driver
  pickupLocation: Location
  dropOffLocation: Location
  from: string
  to: string
  status: BookingStatus
  price?: number
  kmOut?: number
  fuelOut?: string
  kmIn?: number
  fuelIn?: string
  picturesOut?: string[]
  picturesIn?: string[]
  remarksOut?: string
  remarksIn?: string
}

export interface BookingsResult {
  resultData: Booking[]
  pageInfo: { totalRecords: number }
}

/**
 * Fetch all suppliers to use as a filter (necessary to see all bookings as an admin/operator)
 */
export const getAllSuppliers = async (): Promise<any[]> => {
  try {
    const res = await axiosInstance.get('/api/all-suppliers')
    return Array.isArray(res.data) ? res.data : []
  } catch (e) {
    console.error('[getAllSuppliers Error]', e)
    return []
  }
}

/**
 * Fetch bookings with optional filters.
 */
export const getBookings = async (
  filter: BookingFilter = {},
  page = 1,
  size = 100
): Promise<BookingsResult> => {
  const language = UserService.getLanguage()

  // To see ALL bookings, we need the IDs of all suppliers.
  // The backend does { 'supplier._id': { $in: suppliers } }
  // If we send [], we get nothing.
  let supplierIds: string[] = []
  
  // Fetch suppliers if not provided
  const suppliers = await getAllSuppliers()
  supplierIds = suppliers.map(s => s._id)

  const payload = {
    suppliers: supplierIds, 
    statuses: filter.statuses ?? ['paid', 'reserved', 'paidInFull', 'deposit', 'pending'],
    filter: {
      keyword: filter.keyword ?? '',
      from: filter.from,
      to: filter.to,
    },
  }

  if (__DEV__) {
    console.log('[getBookings Request]', JSON.stringify(payload, null, 2))
  }

  const res = await axiosInstance.post(
    `/api/bookings/${page}/${size}/${language}`,
    payload
  )
  const raw = res.data
  
  if (__DEV__) {
    console.log('[getBookings Response Count]', Array.isArray(raw) && raw[0]?.resultData ? raw[0].resultData.length : 0)
  }

  if (Array.isArray(raw) && raw.length > 0) {
    return raw[0] as BookingsResult
  }
  return { resultData: [], pageInfo: { totalRecords: 0 } }
}

/**
 * Get a single booking by ID.
 */
export const getBooking = async (id: string): Promise<Booking> => {
  const language = UserService.getLanguage()
  const res = await axiosInstance.get(
    `/api/booking/${encodeURIComponent(id)}/${language}`
  )
  return res.data
}

/**
 * Submit Departure / Checkout data.
 */
export const checkoutDeparture = async (id: string, formData: FormData): Promise<Booking> => {
  const res = await axiosInstance.post(
    `/api/checkout-departure/${encodeURIComponent(id)}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return res.data
}

/**
 * Submit Return / Check-in data.
 */
export const checkinReturn = async (id: string, formData: FormData): Promise<Booking> => {
  const res = await axiosInstance.post(
    `/api/checkin-return/${encodeURIComponent(id)}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return res.data
}
