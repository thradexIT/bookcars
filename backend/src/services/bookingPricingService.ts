import * as bookcarsTypes from ':bookcars-types'
import Booking from '../models/Booking'
import Car from '../models/Car'
import User from '../models/User'
import ClientType from '../models/ClientType'
import * as env from '../config/env.config'

const days = (from: Date, to: Date) => Math.ceil((to.getTime() - from.getTime()) / (1000 * 3600 * 24))
const hours = (from: Date, to: Date) => Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60))
const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

/**
 * MitoS reservation payment policy.
 *
 * The customer has one partial-payment choice: pay now to secure the booking.
 * The amount is selected by policy, never by the browser:
 *
 *   max(S/ 35, 10% of the authoritative rental total)
 *
 * A defensive cap prevents the reservation payment from ever exceeding the
 * full rental amount if a future product is priced below the current S/ 35
 * MitoS floor.
 */
export const MITOS_RESERVATION_PAYMENT_FLOOR = 35
export const MITOS_RESERVATION_PAYMENT_RATE = 0.10

export const calculateReservationPayment = (rentalPrice: number) => {
  const normalizedRentalPrice = money(Number(rentalPrice))
  if (!(normalizedRentalPrice > 0)) return 0

  return money(Math.min(
    normalizedRentalPrice,
    Math.max(MITOS_RESERVATION_PAYMENT_FLOOR, normalizedRentalPrice * MITOS_RESERVATION_PAYMENT_RATE),
  ))
}

/**
 * Server counterpart of the shared BookCars price calculation. Payment
 * creation must never trust a browser-provided amount.
 */
export const calculateRentalPrice = (
  car: bookcarsTypes.Car,
  from: Date,
  to: Date,
  priceChangeRate: number,
  options: bookcarsTypes.CarOptions,
  clientDiscount = 0,
) => {
  let totalPrice = 0
  let totalDays = days(from, to)

  if (car.isDateBasedPrice) {
    const currentDate = new Date(from)
    currentDate.setHours(0, 0, 0, 0)

    let currentDay = 1
    while (currentDay <= totalDays) {
      let applicableRate = car.discountedDailyPrice || car.dailyPrice

      for (const dateBasedPrice of car.dateBasedPrices || []) {
        if (!dateBasedPrice.startDate || !dateBasedPrice.endDate) continue

        const startDate = new Date(dateBasedPrice.startDate)
        const endDate = new Date(dateBasedPrice.endDate)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(0, 0, 0, 0)

        if (currentDate.getTime() >= startDate.getTime() && currentDate.getTime() <= endDate.getTime()) {
          applicableRate = Number(dateBasedPrice.dailyPrice)
          break
        }
      }

      totalPrice += applicableRate
      currentDate.setDate(currentDate.getDate() + 1)
      currentDate.setHours(0, 0, 0, 0)
      currentDay += 1
    }
  } else {
    const totalHours = hours(from, to)
    totalDays = Math.floor(totalHours / 24)
    const remainingHours = totalHours % 24
    let remainingDays = totalDays

    if (remainingDays >= 30 && (car.discountedMonthlyPrice || car.monthlyPrice)) {
      totalPrice += (car.discountedMonthlyPrice || car.monthlyPrice)! * Math.floor(remainingDays / 30)
      remainingDays %= 30
    }
    if (remainingDays >= 7 && (car.discountedWeeklyPrice || car.weeklyPrice)) {
      totalPrice += (car.discountedWeeklyPrice || car.weeklyPrice)! * Math.floor(remainingDays / 7)
      remainingDays %= 7
    }
    if (remainingDays >= 3 && (car.discountedBiWeeklyPrice || car.biWeeklyPrice)) {
      totalPrice += (car.discountedBiWeeklyPrice || car.biWeeklyPrice)! * Math.floor(remainingDays / 3)
      remainingDays %= 3
    }
    if (remainingDays > 0) {
      totalPrice += (car.discountedDailyPrice || car.dailyPrice) * remainingDays
    }

    if (totalDays === 0 || remainingHours > 0) {
      const hourlyRate = car.discountedHourlyPrice || car.hourlyPrice
      if (hourlyRate) {
        totalPrice += hourlyRate * remainingHours
      } else {
        totalPrice += car.discountedDailyPrice || car.dailyPrice
      }
    }
  }

  if (options.cancellation && car.cancellation > 0) totalPrice += car.cancellation
  if (options.amendments && car.amendments > 0) totalPrice += car.amendments
  if (options.theftProtection && car.theftProtection > 0) totalPrice += car.theftProtection * totalDays
  if (options.collisionDamageWaiver && car.collisionDamageWaiver > 0) totalPrice += car.collisionDamageWaiver * totalDays
  if (options.fullInsurance && car.fullInsurance > 0) totalPrice += car.fullInsurance * totalDays
  if (options.additionalDriver && car.additionalDriver > 0) totalPrice += car.additionalDriver * totalDays

  totalPrice += totalPrice * (priceChangeRate / 100)
  if (clientDiscount > 0) totalPrice *= 1 - (clientDiscount / 100)

  return money(totalPrice)
}

export const getAuthoritativeBookingCharge = async (bookingId: string) => {
  const booking = await Booking.findById(bookingId)
  if (!booking) throw new Error('Booking not found')

  const car = await Car.findById(booking.car).populate<{ supplier: bookcarsTypes.User }>('supplier')
  if (!car) throw new Error('Car not found')

  const driver = await User.findById(booking.driver)
  if (!driver) throw new Error('Driver not found')

  let clientType: bookcarsTypes.ClientType | null = null
  if (driver.clientType) {
    clientType = await ClientType.findById(driver.clientType).lean() as bookcarsTypes.ClientType | null
  }

  // The legacy UI contains a USD-based deductible special case. Charging an
  // insurance customer before that rule is moved server-side with an explicit
  // FX policy could produce a wrong amount, so fail closed for now.
  if (clientType?.name === 'Insurance') {
    throw new Error('Insurance payment pricing requires an authoritative server-side deductible rule')
  }

  const priceChangeRate = car.supplier?.priceChangeRate || 0
  const rentalPrice = calculateRentalPrice(
    car.toObject() as unknown as bookcarsTypes.Car,
    new Date(booking.from),
    new Date(booking.to),
    priceChangeRate,
    {
      cancellation: booking.cancellation,
      amendments: booking.amendments,
      theftProtection: booking.theftProtection,
      collisionDamageWaiver: booking.collisionDamageWaiver,
      fullInsurance: booking.fullInsurance,
      additionalDriver: booking.additionalDriver,
    },
    clientType?.privileges?.rentDiscount || 0,
  )

  // Warranty/security deposit remains a separate concept from the MitoS
  // reservation payment. It is still returned for legacy consumers and UI.
  let deposit = Number(car.deposit || 0)
  deposit += deposit * (priceChangeRate / 100)
  if (clientType?.name === 'Internal') deposit = 0
  deposit = money(deposit)

  const reservationPayment = calculateReservationPayment(rentalPrice)

  // Payment choice is represented by the existing booking flags, but the
  // amount is always derived here from server-owned booking/car data.
  let amount = rentalPrice
  if (booking.isDeposit) amount = reservationPayment
  if (booking.isPayedInFull) amount = rentalPrice
  amount = money(amount)

  if (!(amount > 0)) throw new Error('Payment amount must be greater than zero')

  const baseCurrency = env.__env__('BC_BASE_CURRENCY', false, 'PEN').toUpperCase()
  const mercadoPagoCurrency = env.__env__('BC_MERCADO_PAGO_CURRENCY', false, 'PEN').toUpperCase()
  if (baseCurrency !== mercadoPagoCurrency) {
    throw new Error(`Payment currency mismatch: pricing=${baseCurrency}, mercadoPago=${mercadoPagoCurrency}`)
  }

  // Replace the client-submitted booking price with the server-derived rental
  // price once a provider payment is prepared.
  if (booking.price !== rentalPrice) {
    booking.price = rentalPrice
    await booking.save()
  }

  return {
    booking,
    car,
    driver,
    amount,
    rentalPrice,
    deposit,
    reservationPayment,
    currency: mercadoPagoCurrency,
  }
}
