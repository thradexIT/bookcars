const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

export const MITOS_RESERVATION_PAYMENT_FLOOR = 35
export const MITOS_RESERVATION_PAYMENT_RATE = 0.10

/**
 * MitoS reservation payment policy.
 *
 * Customers do not choose between a fixed amount and a percentage. The system
 * charges whichever is greater: S/ 35 or 10% of the authoritative rental
 * total. The defensive cap prevents a future rental priced below S/ 35 from
 * being charged more than its full rental total.
 */
export const calculateReservationPayment = (rentalPrice: number) => {
  const normalizedRentalPrice = money(Number(rentalPrice))
  if (!(normalizedRentalPrice > 0)) return 0

  return money(Math.min(
    normalizedRentalPrice,
    Math.max(MITOS_RESERVATION_PAYMENT_FLOOR, normalizedRentalPrice * MITOS_RESERVATION_PAYMENT_RATE),
  ))
}
