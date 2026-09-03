import assert from 'node:assert/strict'
import {
  calculateReservationPayment,
  MITOS_RESERVATION_PAYMENT_FLOOR,
  MITOS_RESERVATION_PAYMENT_RATE,
} from '../src/services/mitosReservationPaymentPolicy'

assert.equal(MITOS_RESERVATION_PAYMENT_FLOOR, 35)
assert.equal(MITOS_RESERVATION_PAYMENT_RATE, 0.10)
assert.equal(calculateReservationPayment(40), 35)
assert.equal(calculateReservationPayment(105), 35)
assert.equal(calculateReservationPayment(350), 35)
assert.equal(calculateReservationPayment(1000), 100)
assert.equal(calculateReservationPayment(1234.56), 123.46)
assert.equal(calculateReservationPayment(20), 20)
assert.equal(calculateReservationPayment(0), 0)
assert.equal(calculateReservationPayment(-10), 0)

console.log('[mitos-flexible-payment] policy certification passed')
