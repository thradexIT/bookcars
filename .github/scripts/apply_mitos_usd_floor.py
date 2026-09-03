from pathlib import Path
import re


def read(path: str) -> str:
    return Path(path).read_text()


def write(path: str, content: str) -> None:
    Path(path).write_text(content)


def replace_once(path: str, old: str, new: str) -> None:
    text = read(path)
    if old not in text:
        raise SystemExit(f"Expected fragment not found in {path}: {old[:120]!r}")
    write(path, text.replace(old, new, 1))


def regex_once(path: str, pattern: str, replacement: str) -> None:
    text = read(path)
    updated, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f"Expected one regex match in {path}, got {count}: {pattern[:120]!r}")
    write(path, updated)


write('backend/src/services/mitosReservationPaymentPolicy.ts', '''const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

export const MITOS_RESERVATION_PAYMENT_FLOOR_USD = 35
export const MITOS_RESERVATION_PAYMENT_RATE = 0.10

export interface MitosReservationPaymentPolicy {
  amount: number
  balanceDue: number
  floorUsd: number
  floorAmount: number
  percentageRate: number
  percentageAmount: number
  usdToPaymentCurrencyRate: number
}

/**
 * MitoS reservation payment policy.
 *
 * The business floor is denominated in USD, while Mercado Pago Peru charges
 * in the configured payment currency (currently PEN). The caller must provide
 * the authoritative USD -> payment-currency rate. That rate is snapshotted on
 * the booking by bookingPricingService so later provider reconciliation does
 * not drift when FX changes.
 */
export const calculateReservationPayment = (
  rentalPrice: number,
  usdToPaymentCurrencyRate: number,
): MitosReservationPaymentPolicy => {
  const normalizedRentalPrice = money(Number(rentalPrice))
  const normalizedFxRate = Number(usdToPaymentCurrencyRate)

  if (!(normalizedRentalPrice > 0)) {
    return {
      amount: 0,
      balanceDue: 0,
      floorUsd: MITOS_RESERVATION_PAYMENT_FLOOR_USD,
      floorAmount: 0,
      percentageRate: MITOS_RESERVATION_PAYMENT_RATE,
      percentageAmount: 0,
      usdToPaymentCurrencyRate: normalizedFxRate,
    }
  }

  if (!Number.isFinite(normalizedFxRate) || normalizedFxRate <= 0) {
    throw new Error('USD to payment currency rate must be greater than zero')
  }

  const floorAmount = money(MITOS_RESERVATION_PAYMENT_FLOOR_USD * normalizedFxRate)
  const percentageAmount = money(normalizedRentalPrice * MITOS_RESERVATION_PAYMENT_RATE)
  const amount = money(Math.min(normalizedRentalPrice, Math.max(floorAmount, percentageAmount)))

  return {
    amount,
    balanceDue: money(Math.max(normalizedRentalPrice - amount, 0)),
    floorUsd: MITOS_RESERVATION_PAYMENT_FLOOR_USD,
    floorAmount,
    percentageRate: MITOS_RESERVATION_PAYMENT_RATE,
    percentageAmount,
    usdToPaymentCurrencyRate: normalizedFxRate,
  }
}
''')

write('backend/scripts/mitos-flexible-reservation-payment-policy-cert.ts', '''import assert from 'node:assert/strict'
import {
  calculateReservationPayment,
  MITOS_RESERVATION_PAYMENT_FLOOR_USD,
  MITOS_RESERVATION_PAYMENT_RATE,
} from '../src/services/mitosReservationPaymentPolicy'

assert.equal(MITOS_RESERVATION_PAYMENT_FLOOR_USD, 35)
assert.equal(MITOS_RESERVATION_PAYMENT_RATE, 0.10)

const fx = 3.80
const low = calculateReservationPayment(200, fx)
assert.equal(low.floorAmount, 133)
assert.equal(low.percentageAmount, 20)
assert.equal(low.amount, 133)
assert.equal(low.balanceDue, 67)

const threshold = calculateReservationPayment(1330, fx)
assert.equal(threshold.amount, 133)
assert.equal(threshold.balanceDue, 1197)

const high = calculateReservationPayment(2000, fx)
assert.equal(high.percentageAmount, 200)
assert.equal(high.amount, 200)
assert.equal(high.balanceDue, 1800)

const capped = calculateReservationPayment(100, fx)
assert.equal(capped.amount, 100)
assert.equal(capped.balanceDue, 0)

assert.equal(calculateReservationPayment(0, fx).amount, 0)
assert.throws(() => calculateReservationPayment(100, 0), /greater than zero/)

console.log('[mitos-flexible-payment] USD-floor policy certification passed')
''')

write('backend/__tests__/bookingPricingService.test.ts', '''import {
  calculateReservationPayment,
  MITOS_RESERVATION_PAYMENT_FLOOR_USD,
  MITOS_RESERVATION_PAYMENT_RATE,
} from '../src/services/mitosReservationPaymentPolicy'

describe('MitoS reservation payment policy', () => {
  const usdToPen = 3.80

  it('uses a USD 35 floor converted to the payment currency', () => {
    expect(MITOS_RESERVATION_PAYMENT_FLOOR_USD).toBe(35)
    expect(MITOS_RESERVATION_PAYMENT_RATE).toBe(0.10)
    const result = calculateReservationPayment(200, usdToPen)
    expect(result.floorAmount).toBe(133)
    expect(result.percentageAmount).toBe(20)
    expect(result.amount).toBe(133)
    expect(result.balanceDue).toBe(67)
  })

  it('uses 10% once the percentage exceeds the converted USD floor', () => {
    const result = calculateReservationPayment(2000, usdToPen)
    expect(result.floorAmount).toBe(133)
    expect(result.percentageAmount).toBe(200)
    expect(result.amount).toBe(200)
    expect(result.balanceDue).toBe(1800)
  })

  it('never charges more than the rental total', () => {
    const result = calculateReservationPayment(100, usdToPen)
    expect(result.amount).toBe(100)
    expect(result.balanceDue).toBe(0)
  })

  it('fails closed for an invalid FX rate', () => {
    expect(() => calculateReservationPayment(200, 0)).toThrow('USD to payment currency rate must be greater than zero')
  })
})
''')

booking_schema_fields = '''    reservationPaymentAmount: {\n      type: Number,\n      min: 0,\n    },\n    reservationPaymentCurrency: String,\n    reservationPaymentFloorUsd: {\n      type: Number,\n      min: 0,\n    },\n    reservationPaymentFxRate: {\n      type: Number,\n      min: 0,\n    },\n    reservationPaymentRate: {\n      type: Number,\n      min: 0,\n    },\n    reservationPaymentRentalPrice: {\n      type: Number,\n      min: 0,\n    },\n    paidAmount: {\n      type: Number,\n      min: 0,\n    },\n    balanceDue: {\n      type: Number,\n      min: 0,\n    },\n    paymentCurrency: String,\n'''
replace_once(
    'backend/src/models/Booking.ts',
    "    isPayedInFull: {\n      type: Boolean,\n      default: false,\n    },\n    paypalOrderId: {",
    "    isPayedInFull: {\n      type: Boolean,\n      default: false,\n    },\n" + booking_schema_fields + "    paypalOrderId: {",
)

booking_type_fields = '''  reservationPaymentAmount?: number\n  reservationPaymentCurrency?: string\n  reservationPaymentFloorUsd?: number\n  reservationPaymentFxRate?: number\n  reservationPaymentRate?: number\n  reservationPaymentRentalPrice?: number\n  paidAmount?: number\n  balanceDue?: number\n  paymentCurrency?: string\n'''
replace_once(
    'packages/bookcars-types/index.ts',
    "  isPayedInFull?: boolean\n  paypalOrderId?: string",
    "  isPayedInFull?: boolean\n" + booking_type_fields + "  paypalOrderId?: string",
)
replace_once(
    'backend/src/config/env.config.ts',
    "  isPayedInFull?: boolean\n  paypalOrderId?: string",
    "  isPayedInFull?: boolean\n" + booking_type_fields + "  paypalOrderId?: string",
)

service_path = 'backend/src/services/bookingPricingService.ts'
service = read(service_path)
service_pattern = r"  // Warranty/security deposit remains a separate concept.*?  return \{\n    booking,\n    car,\n    driver,\n    amount,\n    rentalPrice,\n    deposit,\n    reservationPayment,\n    currency: mercadoPagoCurrency,\n  \}\n"
service_replacement = '''  // Warranty/security deposit remains a separate concept from the MitoS
  // reservation payment. It is still returned for legacy consumers and UI.
  let deposit = Number(car.deposit || 0)
  deposit += deposit * (priceChangeRate / 100)
  if (clientType?.name === 'Internal') deposit = 0
  deposit = money(deposit)

  const baseCurrency = env.__env__('BC_BASE_CURRENCY', false, 'PEN').toUpperCase()
  const mercadoPagoCurrency = env.__env__('BC_MERCADO_PAGO_CURRENCY', false, 'PEN').toUpperCase()
  if (baseCurrency !== mercadoPagoCurrency) {
    throw new Error(`Payment currency mismatch: pricing=${baseCurrency}, mercadoPago=${mercadoPagoCurrency}`)
  }

  let bookingDirty = false
  let reservationPayment = rentalPrice
  let reservationPolicy: ReturnType<typeof calculateReservationPayment> | undefined

  if (booking.isDeposit) {
    const snapshotMatches = Number(booking.reservationPaymentAmount || 0) > 0
      && booking.reservationPaymentCurrency === mercadoPagoCurrency
      && Number(booking.reservationPaymentFxRate || 0) > 0
      && Number(booking.reservationPaymentRentalPrice || 0) === rentalPrice

    if (snapshotMatches) {
      reservationPayment = money(Number(booking.reservationPaymentAmount))
      const snapshotFxRate = Number(booking.reservationPaymentFxRate)
      const recalculated = calculateReservationPayment(rentalPrice, snapshotFxRate)
      reservationPolicy = {
        ...recalculated,
        amount: reservationPayment,
        balanceDue: money(Math.max(rentalPrice - reservationPayment, 0)),
      }
    } else {
      const usdToPaymentCurrencyRate = mercadoPagoCurrency === 'USD'
        ? 1
        : Number(env.__env__('BC_MITOS_USD_TO_PAYMENT_CURRENCY_RATE', false))

      if (!Number.isFinite(usdToPaymentCurrencyRate) || usdToPaymentCurrencyRate <= 0) {
        throw new Error('BC_MITOS_USD_TO_PAYMENT_CURRENCY_RATE must be configured with a positive rate for non-USD payments')
      }

      reservationPolicy = calculateReservationPayment(rentalPrice, usdToPaymentCurrencyRate)
      reservationPayment = reservationPolicy.amount
      booking.reservationPaymentAmount = reservationPolicy.amount
      booking.reservationPaymentCurrency = mercadoPagoCurrency
      booking.reservationPaymentFloorUsd = reservationPolicy.floorUsd
      booking.reservationPaymentFxRate = reservationPolicy.usdToPaymentCurrencyRate
      booking.reservationPaymentRate = reservationPolicy.percentageRate
      booking.reservationPaymentRentalPrice = rentalPrice
      bookingDirty = true
    }
  }

  let amount = rentalPrice
  if (booking.isDeposit) amount = reservationPayment
  if (booking.isPayedInFull) amount = rentalPrice
  amount = money(amount)

  if (!(amount > 0)) throw new Error('Payment amount must be greater than zero')

  const balanceDue = money(Math.max(rentalPrice - amount, 0))
  const paymentPlan = booking.isDeposit ? 'reservation' : booking.isPayedInFull ? 'full' : 'online'

  if (booking.price !== rentalPrice) {
    booking.price = rentalPrice
    bookingDirty = true
  }
  if (bookingDirty) {
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
    balanceDue,
    paymentPlan,
    reservationPolicy,
    currency: mercadoPagoCurrency,
  }
}
'''
updated_service, count = re.subn(service_pattern, service_replacement, service, count=1, flags=re.S)
if count != 1:
    raise SystemExit(f'bookingPricingService replacement count={count}')
write(service_path, updated_service)

controller = 'backend/src/controllers/mercadoPagoController.ts'
replace_once(
    controller,
    "const payment = new Payment(client)\n\nconst getIdempotencyKey",
    "const payment = new Payment(client)\nconst money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100\n\nconst getIdempotencyKey",
)
replace_once(
    controller,
    "  booking.paymentIntentId = transaction.providerPaymentId\n  booking.expireAt = undefined",
    "  booking.paidAmount = money(transaction.amount)\n  booking.balanceDue = money(Math.max(Number(booking.price) - booking.paidAmount, 0))\n  booking.paymentCurrency = transaction.currency\n  booking.paymentIntentId = transaction.providerPaymentId\n  booking.expireAt = undefined",
)
replace_once(
    controller,
    "    res.json({\n      bookingId,\n      amount: charge.amount,\n      currency: charge.currency,\n    })",
    "    res.json({\n      bookingId,\n      amount: charge.amount,\n      currency: charge.currency,\n      rentalPrice: charge.rentalPrice,\n      balanceDue: charge.balanceDue,\n      paymentPlan: charge.paymentPlan,\n      reservationPolicy: charge.reservationPolicy,\n    })",
)

replace_once(
    'backend/.env.example',
    "BC_MERCADO_PAGO_CURRENCY=PEN\n",
    "BC_MERCADO_PAGO_CURRENCY=PEN\n# Required when payment currency is not USD. Authoritative USD -> payment-currency\n# rate used to convert the US$35 reservation floor; each booking snapshots it.\nBC_MITOS_USD_TO_PAYMENT_CURRENCY_RATE=\n",
)
replace_once(
    'backend/.env.example',
    "MITOS_DEMO_SUPPLIER_EMAIL=\n",
    "MITOS_DEMO_SUPPLIER_EMAIL=\n# DEV fixture prices are expressed in BC_BASE_CURRENCY.\nMITOS_DEV_YARIS_DAILY_PRICE=\nMITOS_DEV_RAIZE_DAILY_PRICE=\n",
)

seed = 'backend/src/setup/mitosDevSeed.ts'
replace_once(
    seed,
    "  const supplierEmail = requiredFixtureValue('MITOS_DEMO_SUPPLIER_EMAIL')\n",
    "  const supplierEmail = requiredFixtureValue('MITOS_DEMO_SUPPLIER_EMAIL')\n  const yarisDailyPrice = Number(requiredFixtureValue('MITOS_DEV_YARIS_DAILY_PRICE'))\n  const raizeDailyPrice = Number(requiredFixtureValue('MITOS_DEV_RAIZE_DAILY_PRICE'))\n  if (!(yarisDailyPrice > 0) || !(raizeDailyPrice > 0)) {\n    throw new Error('MITOS DEV daily prices must be positive values expressed in BC_BASE_CURRENCY')\n  }\n",
)
replace_once(seed, "        dailyPrice: 35,", "        dailyPrice: yarisDailyPrice,")
replace_once(seed, "        dailyPrice: 45,", "        dailyPrice: raizeDailyPrice,")

mp_service = 'frontend/src/services/MercadoPagoService.ts'
replace_once(
    mp_service,
    "export interface MercadoPagoQuote {\n  bookingId: string\n  amount: number\n  currency: string\n}",
    "export interface MercadoPagoQuote {\n  bookingId: string\n  amount: number\n  currency: string\n  rentalPrice: number\n  balanceDue: number\n  paymentPlan: 'reservation' | 'full' | 'online'\n  reservationPolicy?: {\n    amount: number\n    balanceDue: number\n    floorUsd: number\n    floorAmount: number\n    percentageRate: number\n    percentageAmount: number\n    usdToPaymentCurrencyRate: number\n  }\n}",
)

lang = 'frontend/src/lang/checkout.ts'
replace_once(lang, "PAY_DEPOSIT_INFO: 'Payez le montant le plus élevé entre S/ 35 et 10 % du total. Le solde restant est dû lors du retrait.',", "PAY_DEPOSIT_INFO: 'Payez le montant le plus élevé entre 35 USD (convertis dans la devise de paiement) et 10 % du total. Le solde restant est dû lors du retrait.',\n    CALCULATED_ON_CONTINUE: 'Calculé en toute sécurité à l’étape suivante',\n    BALANCE_AT_PICKUP: 'Solde à payer lors du retrait',")
replace_once(lang, "PAY_DEPOSIT_INFO: 'Pay whichever is greater: S/ 35 or 10% of the total. The remaining balance is due at pickup.',", "PAY_DEPOSIT_INFO: 'Pay whichever is greater: US$35 (converted to the payment currency) or 10% of the total. The remaining balance is due at pickup.',\n    CALCULATED_ON_CONTINUE: 'Calculated securely on the next step',\n    BALANCE_AT_PICKUP: 'Balance due at pickup',")
replace_once(lang, "PAY_DEPOSIT_INFO: 'Paga el mayor entre S/ 35 y el 10% del total. El saldo restante se paga al recoger el vehículo.',", "PAY_DEPOSIT_INFO: 'Paga el mayor entre US$35 (convertidos a la moneda de cobro) y el 10% del total. El saldo restante se paga al recoger el vehículo.',\n    CALCULATED_ON_CONTINUE: 'Se calcula de forma segura al continuar',\n    BALANCE_AT_PICKUP: 'Saldo a pagar al recoger',")

checkout = 'frontend/src/pages/Checkout.tsx'
regex_once(
    checkout,
    r"\nconst MITOS_RESERVATION_PAYMENT_FLOOR = 35\nconst MITOS_RESERVATION_PAYMENT_RATE = 0\.10\nconst calculateReservationPayment = \(rentalTotal: number\) => \{.*?\n\}\n\nconst Checkout",
    "\nconst Checkout",
)
replace_once(checkout, "  const reservationPayment = calculateReservationPayment(price)\n", "")
replace_once(
    checkout,
    "          if (payDeposit) {\n            finalPrice = reservationPayment\n          }",
    "          if (payDeposit) {\n            throw new Error('MitoS partial reservation payments are authoritative through Mercado Pago only')\n          }",
)
replace_once(
    checkout,
    "                            {clientTypeName !== 'Internal' && (",
    "                            {clientTypeName !== 'Internal' && env.PAYMENT_GATEWAY === bookcarsTypes.PaymentGateway.MercadoPago && (",
)
replace_once(
    checkout,
    "                                    <span>{strings.PAY_DEPOSIT} — {bookcarsHelper.formatPrice(reservationPayment, commonStrings.CURRENCY, language)}</span>",
    "                                    <span>{strings.PAY_DEPOSIT}</span>",
)
old_amount_block = '''                          mercadoPagoQuote
                            ? bookcarsHelper.formatPrice(mercadoPagoQuote.amount, commonStrings.CURRENCY, language)
                            : bookcarsHelper.formatPrice(
                              payDeposit ? reservationPayment
                                : (price - (clientTypeName === 'Insurance' ? deductible : 0))
                              , commonStrings.CURRENCY, language)
'''
new_amount_block = '''                          mercadoPagoQuote
                            ? bookcarsHelper.formatPrice(mercadoPagoQuote.amount, commonStrings.CURRENCY, language)
                            : payDeposit
                              ? strings.CALCULATED_ON_CONTINUE
                              : bookcarsHelper.formatPrice(
                                price - (clientTypeName === 'Insurance' ? deductible : 0),
                                commonStrings.CURRENCY,
                                language,
                              )
'''
replace_once(checkout, old_amount_block, new_amount_block)
replace_once(
    checkout,
    "                      </div>\n                    </div>\n\n                    {!payLater && (",
    "                      </div>\n                      {mercadoPagoQuote && payDeposit && (\n                        <div className=\"payment-info-balance\" style={{ marginTop: 6 }}>\n                          {strings.BALANCE_AT_PICKUP}: {bookcarsHelper.formatPrice(mercadoPagoQuote.balanceDue, commonStrings.CURRENCY, language)}\n                        </div>\n                      )}\n                    </div>\n\n                    {!payLater && (",
)
replace_once(
    checkout,
    "                                    if (payDeposit) {\n                                      amount = reservationPayment\n                                    }",
    "                                    if (payDeposit) {\n                                      throw new Error('MitoS partial reservation payments are authoritative through Mercado Pago only')\n                                    }",
)

write('frontend/src/lang/checkout-status.ts', '''import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'
import env from '@/config/env.config'

const strings = new LocalizedStrings({
  fr: {
    CONGRATULATIONS: 'Félicitation!',
    SUCCESS: 'Votre paiement a été effectué avec succès. Votre réservation est confirmée.',
    SUCCESS_DEPOSIT: 'Votre paiement de réservation a été approuvé. Votre réservation est garantie.',
    SUCCESS_PAY_LATER: 'Votre réservation a été effectuée avec succès.',
    ERROR: 'Une erreur est survenue. Veuillez réessayer plus tard.',
    STATUS_TITLE: `${env.WEBSITE_NAME} Confirmation de réservation`,
    STATUS_MESSAGE: 'Votre réservation est enregistrée. Vous pouvez consulter ses détails dans vos réservations.',
    STATUS_MESSAGE_DEPOSIT: 'Votre réservation est garantie. Le solde restant est dû lors du retrait du véhicule.',
    PAID_NOW: 'Payé maintenant',
    BALANCE_DUE: 'Solde restant',
  },
  en: {
    CONGRATULATIONS: 'Congratulations!',
    SUCCESS: 'Your payment was completed successfully. Your booking is confirmed.',
    SUCCESS_DEPOSIT: 'Your reservation payment was approved. Your booking is secured.',
    SUCCESS_PAY_LATER: 'Your booking was completed successfully.',
    ERROR: 'Something went wrong. Please try again later.',
    STATUS_TITLE: `${env.WEBSITE_NAME} Booking Confirmation`,
    STATUS_MESSAGE: 'Your booking has been recorded. You can review its details in My Bookings.',
    STATUS_MESSAGE_DEPOSIT: 'Your booking is secured. The remaining balance is due when you collect the vehicle.',
    PAID_NOW: 'Paid now',
    BALANCE_DUE: 'Balance due',
  },
  es: {
    CONGRATULATIONS: '¡Felicitaciones!',
    SUCCESS: 'Tu pago se realizó con éxito. Tu reserva está confirmada.',
    SUCCESS_DEPOSIT: 'Tu pago de reserva fue aprobado. Tu reserva está asegurada.',
    SUCCESS_PAY_LATER: 'Tu reserva se ha realizado con éxito.',
    ERROR: 'Algo salió mal. Inténtelo nuevamente más tarde.',
    STATUS_TITLE: `${env.WEBSITE_NAME} Confirmación de reserva`,
    STATUS_MESSAGE: 'Tu reserva ha quedado registrada. Puedes consultar sus detalles en Mis reservas.',
    STATUS_MESSAGE_DEPOSIT: 'Tu reserva está asegurada. El saldo restante se paga al recoger el vehículo.',
    PAID_NOW: 'Pagado ahora',
    BALANCE_DUE: 'Saldo pendiente',
  },
})

langHelper.setLanguage(strings)
export { strings }
''')

status = 'frontend/src/components/CheckoutStatus.tsx'
replace_once(status, "  const [price, setPrice] = useState(0)\n  const [loading, setLoading] = useState(true)", "  const [price, setPrice] = useState(0)\n  const [paidAmount, setPaidAmount] = useState(0)\n  const [balanceDue, setBalanceDue] = useState(0)\n  const [loading, setLoading] = useState(true)")
replace_once(status, "      setBooking(_booking)\n      setPrice(await PaymentService.convertPrice(_booking.price!))\n      setLoading(false)", "      setBooking(_booking)\n      setPrice(await PaymentService.convertPrice(_booking.price!))\n      setPaidAmount(await PaymentService.convertPrice(_booking.paidAmount || 0))\n      setBalanceDue(await PaymentService.convertPrice(_booking.balanceDue ?? Math.max((_booking.price || 0) - (_booking.paidAmount || 0), 0)))\n      setLoading(false)")
replace_once(status, "  const success = status === 'success'\n\n  return booking && (", "  const success = status === 'success'\n  const partialPayment = booking.status === bookcarsTypes.BookingStatus.Deposit\n\n  return booking && (")
replace_once(status, "          ? payLater ? strings.SUCCESS_PAY_LATER : strings.SUCCESS\n          : strings.ERROR}", "          ? payLater ? strings.SUCCESS_PAY_LATER : partialPayment ? strings.SUCCESS_DEPOSIT : strings.SUCCESS\n          : strings.ERROR}")
replace_once(
    status,
    "              <div className=\"status-detail\">\n                <span className=\"status-detail-title\">{checkoutStrings.COST}</span>\n                <div className=\"status-detail-value status-price\">{bookcarsHelper.formatPrice(price, commonStrings.CURRENCY, language)}</div>\n              </div>",
    "              <div className=\"status-detail\">\n                <span className=\"status-detail-title\">{checkoutStrings.COST}</span>\n                <div className=\"status-detail-value status-price\">{bookcarsHelper.formatPrice(price, commonStrings.CURRENCY, language)}</div>\n              </div>\n              {partialPayment && (\n                <>\n                  <div className=\"status-detail\">\n                    <span className=\"status-detail-title\">{strings.PAID_NOW}</span>\n                    <div className=\"status-detail-value status-price\">{bookcarsHelper.formatPrice(paidAmount, commonStrings.CURRENCY, language)}</div>\n                  </div>\n                  <div className=\"status-detail\">\n                    <span className=\"status-detail-title\">{strings.BALANCE_DUE}</span>\n                    <div className=\"status-detail-value status-price\">{bookcarsHelper.formatPrice(balanceDue, commonStrings.CURRENCY, language)}</div>\n                  </div>\n                </>\n              )}",
)
replace_once(status, "            <p>{strings.STATUS_MESSAGE}</p>", "            <p>{partialPayment ? strings.STATUS_MESSAGE_DEPOSIT : strings.STATUS_MESSAGE}</p>")

admin_lang = 'admin/src/lang/booking-list.ts'
replace_once(admin_lang, "    PRICE: 'Prix',\n    STATUS:", "    PRICE: 'Prix',\n    PAID: 'Payé',\n    BALANCE: 'Solde',\n    STATUS:")
replace_once(admin_lang, "    PRICE: 'Price',\n    STATUS:", "    PRICE: 'Price',\n    PAID: 'Paid',\n    BALANCE: 'Balance',\n    STATUS:")
replace_once(admin_lang, "    PRICE: 'Precio',\n    STATUS:", "    PRICE: 'Precio',\n    PAID: 'Pagado',\n    BALANCE: 'Saldo',\n    STATUS:")

admin_list = 'admin/src/components/BookingList.tsx'
price_block = '''      {
        field: 'price',
        headerName: strings.PRICE,
        flex: 1,
        renderCell: ({ value }: GridRenderCellParams<bookcarsTypes.Booking, string>) => <span className="bp">{value}</span>,
        valueGetter: (value: number) => bookcarsHelper.formatPrice(value, commonStrings.CURRENCY, language as string),
      },
'''
paid_columns = price_block + '''      {
        field: 'paidAmount',
        headerName: strings.PAID,
        flex: 1,
        valueGetter: (value: number | undefined, row: bookcarsTypes.Booking) => bookcarsHelper.formatPrice(
          value ?? ((row.status === bookcarsTypes.BookingStatus.Paid || row.status === bookcarsTypes.BookingStatus.PaidInFull) ? (row.price || 0) : 0),
          commonStrings.CURRENCY,
          language as string,
        ),
      },
      {
        field: 'balanceDue',
        headerName: strings.BALANCE,
        flex: 1,
        valueGetter: (value: number | undefined, row: bookcarsTypes.Booking) => bookcarsHelper.formatPrice(
          value ?? Math.max((row.price || 0) - (row.paidAmount || 0), 0),
          commonStrings.CURRENCY,
          language as string,
        ),
      },
'''
replace_once(admin_list, price_block, paid_columns)

workflow = '.github/workflows/mitos-flexible-reservation-payment.yml'
replace_once(
    workflow,
    "          npx eslint src/services/bookingPricingService.ts src/services/mitosReservationPaymentPolicy.ts __tests__/bookingPricingService.test.ts scripts/mitos-flexible-reservation-payment-policy-cert.ts --rule 'curly: off'",
    "          npx eslint src/services/bookingPricingService.ts src/services/mitosReservationPaymentPolicy.ts src/controllers/mercadoPagoController.ts src/models/Booking.ts src/setup/mitosDevSeed.ts __tests__/bookingPricingService.test.ts scripts/mitos-flexible-reservation-payment-policy-cert.ts --rule 'curly: off'",
)
replace_once(
    workflow,
    "          npx eslint src/pages/Checkout.tsx src/lang/checkout.ts --rule 'curly: off'",
    "          npx eslint src/pages/Checkout.tsx src/lang/checkout.ts src/lang/checkout-status.ts src/components/CheckoutStatus.tsx src/services/MercadoPagoService.ts --rule 'curly: off'",
)
replace_once(
    workflow,
    "      - name: Build frontend\n        working-directory: frontend\n        run: npm run build\n",
    "      - name: Build frontend\n        working-directory: frontend\n        run: npm run build\n\n  admin-payment-truth:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Checkout\n        uses: actions/checkout@v4\n\n      - name: Use Node.js\n        uses: actions/setup-node@v4\n        with:\n          node-version: lts/*\n\n      - name: Install admin\n        working-directory: admin\n        run: npm install --force\n\n      - name: Lint changed admin slice\n        working-directory: admin\n        run: |\n          npx eslint src/components/BookingList.tsx src/lang/booking-list.ts --rule 'curly: off'\n\n      - name: Build admin\n        working-directory: admin\n        run: npm run build\n",
)

print('MitoS USD-floor patch applied successfully')
