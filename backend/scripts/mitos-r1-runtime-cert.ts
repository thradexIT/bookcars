import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import mongoose from 'mongoose'
import User from '../src/models/User'
import Car from '../src/models/Car'
import Location from '../src/models/Location'
import Booking from '../src/models/Booking'
import ReservationState, { ReservationStatus } from '../src/models/ReservationState'
import RentalLifecycle, { RentalLifecycleState } from '../src/models/RentalLifecycle'

const apiBase = process.env.R1_API_BASE || 'http://127.0.0.1:4002'
const dbUri = process.env.BC_DB_URI || ''
const runId = process.env.GITHUB_RUN_ID || `local-${Date.now()}`
const evidenceDir = process.env.R1_EVIDENCE_DIR || path.resolve(process.cwd(), '../r1-evidence')

const customerEmail = String(process.env.MITOS_DEMO_CUSTOMER_EMAIL || '')
const adminEmail = String(process.env.MITOS_DEMO_ADMIN_EMAIL || '')
const supplierEmail = String(process.env.MITOS_DEMO_SUPPLIER_EMAIL || '')
const password = String(process.env.MITOS_DEMO_PASSWORD || '')

if (!dbUri || !customerEmail || !adminEmail || !supplierEmail || !password) {
  throw new Error('R1 runtime fixture environment is incomplete')
}

type EvidenceStep = {
  name: string
  timestamp: string
  httpStatus?: number
  before?: unknown
  after?: unknown
  replay?: boolean
  note?: string
}

const evidence: {
  runId: string
  startedAt: string
  branch: string
  commit: string
  fixture: Record<string, string>
  steps: EvidenceStep[]
  result: 'running' | 'passed' | 'failed'
  failure?: string
  completedAt?: string
} = {
  runId,
  startedAt: new Date().toISOString(),
  branch: process.env.GITHUB_REF_NAME || 'cert/mitos-r1-pay-later-runtime',
  commit: process.env.GITHUB_SHA || 'local',
  fixture: {
    customerEmail,
    adminEmail,
    supplierEmail,
  },
  steps: [],
  result: 'running',
}

const record = (step: EvidenceStep) => {
  evidence.steps.push(step)
  console.log(`[R1] ${step.name}${step.httpStatus ? ` -> HTTP ${step.httpStatus}` : ''}`)
}

const jsonRequest = async (
  pathname: string,
  init: RequestInit = {},
  expectedStatus?: number,
) => {
  const response = await fetch(`${apiBase}${pathname}`, init)
  const text = await response.text()
  let body: any = text
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  if (expectedStatus !== undefined) {
    assert.equal(response.status, expectedStatus, `${pathname} returned ${response.status}: ${text}`)
  }

  return { response, body }
}

const authHeaders = (token: string, json = false): Record<string, string> => ({
  'x-access-token': token,
  ...(json ? { 'content-type': 'application/json' } : {}),
})

const waitForReservationStatus = async (bookingId: string, status: ReservationStatus, timeoutMs = 7000) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const state = await ReservationState.findOne({ booking: new mongoose.Types.ObjectId(bookingId) }).lean()
    if (state?.status === status) return state
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  const current = await ReservationState.findOne({ booking: new mongoose.Types.ObjectId(bookingId) }).lean()
  throw new Error(`Reservation ${bookingId} did not reach ${status}; current=${current?.status || 'missing'}`)
}

const readLifecycle = async (bookingId: string, token: string) => {
  const { response, body } = await jsonRequest(`/api/rental-lifecycle/${encodeURIComponent(bookingId)}`, {
    headers: authHeaders(token),
  }, 200)
  return { status: response.status, body }
}

const departureForm = () => {
  const form = new FormData()
  form.append('kmOut', '1000')
  form.append('fuelOut', 'full')
  form.append('remarksOut', 'MITOS R1 ephemeral certification')
  return form
}

const returnForm = () => {
  const form = new FormData()
  form.append('kmIn', '1012')
  form.append('fuelIn', 'full')
  form.append('remarksIn', 'MITOS R1 ephemeral certification')
  return form
}

const bookingPayload = ({
  supplierId,
  carId,
  driverId,
  locationId,
  from,
  to,
  price,
}: {
  supplierId: string
  carId: string
  driverId: string
  locationId: string
  from: Date
  to: Date
  price: number
}) => ({
  supplier: supplierId,
  car: carId,
  driver: driverId,
  pickupLocation: locationId,
  dropOffLocation: locationId,
  from: from.toISOString(),
  to: to.toISOString(),
  status: 'pending',
  cancellation: true,
  amendments: true,
  theftProtection: true,
  collisionDamageWaiver: true,
  fullInsurance: true,
  additionalDriver: false,
  price,
})

try {
  await fs.mkdir(evidenceDir, { recursive: true })
  await mongoose.connect(dbUri)

  const [customer, admin, supplier] = await Promise.all([
    User.findOne({ email: customerEmail }),
    User.findOne({ email: adminEmail }),
    User.findOne({ email: supplierEmail }),
  ])

  assert(customer, 'Seeded customer not found')
  assert(admin, 'Seeded admin not found')
  assert(supplier, 'Seeded supplier not found')

  const cars = await Car.find({ supplier: supplier._id }).sort({ name: 1 })
  assert(cars.length >= 2, 'R1 requires the two isolated MitoS fixture vehicles')

  const location = await Location.findOne({ supplier: supplier._id })
  assert(location, 'Seeded location not found')

  const customerSignin = await jsonRequest('/api/sign-in/frontend', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: customerEmail, password, mobile: true }),
  }, 200)
  assert(customerSignin.body?.accessToken, 'Customer mobile access token missing')
  record({ name: 'customer identity accepted by real HTTP auth', timestamp: new Date().toISOString(), httpStatus: 200 })

  const adminSignin = await jsonRequest('/api/sign-in/admin', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password, mobile: true }),
  }, 200)
  const adminToken = String(adminSignin.body?.accessToken || '')
  assert(adminToken, 'Admin mobile access token missing')
  record({ name: 'admin/operator identity accepted by real HTTP auth', timestamp: new Date().toISOString(), httpStatus: 200 })

  const supplierId = supplier._id.toString()
  const driverId = customer._id.toString()
  const locationId = location._id.toString()
  const guardCar = cars[0]
  const rentalCar = cars[1]

  // Negative handover gate through legitimate unpaid checkout flow. No DB state is fabricated.
  const guardFrom = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
  const guardTo = new Date(guardFrom.getTime() + 2 * 24 * 60 * 60 * 1000)
  const guardSessionId = `r1-unpaid-${runId}`
  const guardCheckoutPayload = {
    booking: bookingPayload({
      supplierId,
      carId: guardCar._id.toString(),
      driverId,
      locationId,
      from: guardFrom,
      to: guardTo,
      price: Number(guardCar.dailyPrice || 1) * 2,
    }),
    payLater: false,
    sessionId: guardSessionId,
    payPal: false,
  }

  const guardCheckout = await jsonRequest('/api/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(guardCheckoutPayload),
  }, 200)
  const guardBookingId = String(guardCheckout.body?.bookingId || '')
  assert(guardBookingId, 'Unpaid guard booking id missing')
  await waitForReservationStatus(guardBookingId, ReservationStatus.Pending)
  record({
    name: 'unpaid reservation remains unconfirmed',
    timestamp: new Date().toISOString(),
    httpStatus: 200,
    after: { bookingId: guardBookingId, reservation: ReservationStatus.Pending },
  })

  const guardReplay = await jsonRequest('/api/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(guardCheckoutPayload),
  }, 200)
  assert.equal(String(guardReplay.body?.bookingId || ''), guardBookingId, 'Reservation session replay created another booking')
  assert.equal(await Booking.countDocuments({ sessionId: guardSessionId }), 1, 'Reservation session replay duplicated persisted booking')
  record({
    name: 'reservation-session replay is idempotent',
    timestamp: new Date().toISOString(),
    httpStatus: 200,
    replay: true,
    after: { bookingId: guardBookingId, persistedBookingsForSession: 1 },
  })

  const blockedDeparture = await jsonRequest(`/api/checkout-departure/${encodeURIComponent(guardBookingId)}`, {
    method: 'POST',
    headers: authHeaders(adminToken),
    body: departureForm(),
  }, 409)
  record({
    name: 'physical handover blocked for unconfirmed explicit reservation',
    timestamp: new Date().toISOString(),
    httpStatus: blockedDeparture.response.status,
    before: { reservation: ReservationStatus.Pending },
    after: { lifecycle: RentalLifecycleState.Reserved },
    note: String(blockedDeparture.body),
  })

  const blockedReturn = await jsonRequest(`/api/checkin-return/${encodeURIComponent(guardBookingId)}`, {
    method: 'POST',
    headers: authHeaders(adminToken),
    body: returnForm(),
  }, 409)
  record({
    name: 'return cannot skip checkout',
    timestamp: new Date().toISOString(),
    httpStatus: blockedReturn.response.status,
    before: { lifecycle: RentalLifecycleState.Reserved },
    after: { lifecycle: RentalLifecycleState.Reserved },
    note: String(blockedReturn.body),
  })

  // Primary Pay Later rental journey.
  const from = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const to = new Date(from.getTime() + 2 * 24 * 60 * 60 * 1000)
  const payLaterCheckoutPayload = {
    booking: bookingPayload({
      supplierId,
      carId: rentalCar._id.toString(),
      driverId,
      locationId,
      from,
      to,
      price: Number(rentalCar.dailyPrice || 1) * 2,
    }),
    payLater: true,
  }

  const checkout = await jsonRequest('/api/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payLaterCheckoutPayload),
  }, 200)
  const bookingId = String(checkout.body?.bookingId || '')
  assert(bookingId, 'Pay Later booking id missing')
  const confirmed = await waitForReservationStatus(bookingId, ReservationStatus.Confirmed)
  record({
    name: 'Pay Later checkout creates confirmed reservation',
    timestamp: new Date().toISOString(),
    httpStatus: checkout.response.status,
    before: { reservation: ReservationStatus.Pending },
    after: { bookingId, reservation: confirmed.status },
  })

  const initialLifecycle = await readLifecycle(bookingId, adminToken)
  assert.equal(initialLifecycle.body?.state, RentalLifecycleState.Reserved)
  record({
    name: 'rental lifecycle starts reserved',
    timestamp: new Date().toISOString(),
    httpStatus: initialLifecycle.status,
    after: initialLifecycle.body,
  })

  const suppliersResult = await jsonRequest('/api/all-suppliers', {
    headers: authHeaders(adminToken),
  }, 200)
  assert(Array.isArray(suppliersResult.body), 'Admin supplier list response is not an array')

  const bookingsResult = await jsonRequest('/api/bookings/1/100/es', {
    method: 'POST',
    headers: authHeaders(adminToken, true),
    body: JSON.stringify({
      suppliers: [supplierId],
      statuses: ['paid', 'reserved', 'paidInFull', 'deposit', 'pending'],
      filter: { keyword: '' },
    }),
  }, 200)
  const resultData = Array.isArray(bookingsResult.body) ? bookingsResult.body[0]?.resultData : bookingsResult.body?.resultData
  assert(Array.isArray(resultData), 'Admin/LaborSync booking resultData missing')
  assert(resultData.some((item: any) => String(item?._id) === bookingId), 'Pay Later booking is not visible to Admin/LaborSync query')
  record({
    name: 'booking visible through Admin/LaborSync operational query',
    timestamp: new Date().toISOString(),
    httpStatus: bookingsResult.response.status,
    after: { bookingId, visible: true },
  })

  const departure = await jsonRequest(`/api/checkout-departure/${encodeURIComponent(bookingId)}`, {
    method: 'POST',
    headers: authHeaders(adminToken),
    body: departureForm(),
  }, 200)
  const checkedOutLifecycle = await readLifecycle(bookingId, adminToken)
  assert.equal(checkedOutLifecycle.body?.state, RentalLifecycleState.CheckedOut)
  record({
    name: 'vehicle departure advances lifecycle',
    timestamp: new Date().toISOString(),
    httpStatus: departure.response.status,
    before: { lifecycle: RentalLifecycleState.Reserved },
    after: { lifecycle: checkedOutLifecycle.body.state },
  })

  const departureReplay = await jsonRequest(`/api/checkout-departure/${encodeURIComponent(bookingId)}`, {
    method: 'POST',
    headers: authHeaders(adminToken),
    body: departureForm(),
  }, 200)
  const checkedOutReplayState = await readLifecycle(bookingId, adminToken)
  assert.equal(checkedOutReplayState.body?.state, RentalLifecycleState.CheckedOut)
  assert.equal(await RentalLifecycle.countDocuments({ booking: new mongoose.Types.ObjectId(bookingId) }), 1)
  record({
    name: 'departure replay is idempotent',
    timestamp: new Date().toISOString(),
    httpStatus: departureReplay.response.status,
    replay: true,
    after: { lifecycle: checkedOutReplayState.body.state, lifecycleDocuments: 1 },
  })

  const returned = await jsonRequest(`/api/checkin-return/${encodeURIComponent(bookingId)}`, {
    method: 'POST',
    headers: authHeaders(adminToken),
    body: returnForm(),
  }, 200)
  const returnedLifecycle = await readLifecycle(bookingId, adminToken)
  assert.equal(returnedLifecycle.body?.state, RentalLifecycleState.Returned)
  record({
    name: 'vehicle return advances lifecycle',
    timestamp: new Date().toISOString(),
    httpStatus: returned.response.status,
    before: { lifecycle: RentalLifecycleState.CheckedOut },
    after: { lifecycle: returnedLifecycle.body.state },
  })

  const returnReplay = await jsonRequest(`/api/checkin-return/${encodeURIComponent(bookingId)}`, {
    method: 'POST',
    headers: authHeaders(adminToken),
    body: returnForm(),
  }, 200)
  const returnedReplayState = await readLifecycle(bookingId, adminToken)
  assert.equal(returnedReplayState.body?.state, RentalLifecycleState.Returned)
  record({
    name: 'return replay is idempotent before closure',
    timestamp: new Date().toISOString(),
    httpStatus: returnReplay.response.status,
    replay: true,
    after: { lifecycle: returnedReplayState.body.state },
  })

  const verification = await jsonRequest(`/api/verify-inspection/${encodeURIComponent(bookingId)}`, {
    method: 'POST',
    headers: authHeaders(adminToken, true),
    body: JSON.stringify({
      picturesOutVerified: true,
      picturesInVerified: true,
      verificationRemarks: 'MITOS R1 ephemeral certification',
    }),
  }, 200)
  const closedLifecycle = await readLifecycle(bookingId, adminToken)
  assert.equal(closedLifecycle.body?.state, RentalLifecycleState.Closed)
  const completed = await waitForReservationStatus(bookingId, ReservationStatus.Completed)
  record({
    name: 'inspection closure completes rental and reservation',
    timestamp: new Date().toISOString(),
    httpStatus: verification.response.status,
    before: { lifecycle: RentalLifecycleState.Returned, reservation: ReservationStatus.Confirmed },
    after: { lifecycle: closedLifecycle.body.state, reservation: completed.status },
  })

  const persistedBooking = await Booking.findById(bookingId).lean()
  assert(persistedBooking, 'Final booking missing')
  assert.equal(persistedBooking.kmOut, 1000)
  assert.equal(persistedBooking.kmIn, 1012)
  assert.equal(persistedBooking.picturesOutVerified, true)
  assert.equal(persistedBooking.picturesInVerified, true)
  record({
    name: 'final operational evidence persisted',
    timestamp: new Date().toISOString(),
    after: {
      bookingId,
      kmOut: persistedBooking.kmOut,
      kmIn: persistedBooking.kmIn,
      picturesOutVerified: persistedBooking.picturesOutVerified,
      picturesInVerified: persistedBooking.picturesInVerified,
      reservation: completed.status,
      lifecycle: closedLifecycle.body.state,
    },
  })

  evidence.result = 'passed'
  evidence.completedAt = new Date().toISOString()
  console.log(`[R1] PASS booking=${bookingId}`)
} catch (error) {
  evidence.result = 'failed'
  evidence.failure = error instanceof Error ? error.stack || error.message : String(error)
  evidence.completedAt = new Date().toISOString()
  console.error('[R1] FAIL', error)
  process.exitCode = 1
} finally {
  await fs.mkdir(evidenceDir, { recursive: true })
  await fs.writeFile(path.join(evidenceDir, 'mitos-r1-runtime.json'), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8')
  await mongoose.disconnect().catch(() => undefined)
}
