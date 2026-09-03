import {
  calculateReservationPayment,
  MITOS_RESERVATION_PAYMENT_FLOOR,
  MITOS_RESERVATION_PAYMENT_RATE,
} from '../src/services/bookingPricingService'

describe('MitoS reservation payment policy', () => {
  it('uses the S/ 35 floor when 10% would be too small', () => {
    expect(MITOS_RESERVATION_PAYMENT_FLOOR).toBe(35)
    expect(MITOS_RESERVATION_PAYMENT_RATE).toBe(0.10)
    expect(calculateReservationPayment(40)).toBe(35)
    expect(calculateReservationPayment(105)).toBe(35)
  })

  it('uses 10% once the percentage exceeds the floor', () => {
    expect(calculateReservationPayment(350)).toBe(35)
    expect(calculateReservationPayment(1000)).toBe(100)
    expect(calculateReservationPayment(1234.56)).toBe(123.46)
  })

  it('never charges more than the rental total', () => {
    expect(calculateReservationPayment(20)).toBe(20)
  })

  it('returns zero for invalid non-positive totals', () => {
    expect(calculateReservationPayment(0)).toBe(0)
    expect(calculateReservationPayment(-10)).toBe(0)
  })
})
