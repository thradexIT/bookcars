export enum UserType {
  Admin = 'admin',
  Supplier = 'supplier',
  User = 'user',
}

export enum AppType {
  Admin = 'admin',
  Frontend = 'frontend',
}

export enum CarType {
  Diesel = 'diesel',
  Gasoline = 'gasoline',
  Electric = 'electric',
  Hybrid = 'hybrid',
  PlugInHybrid = 'plugInHybrid',
  Unknown = 'unknown',
}

export enum CarRange {
  Mini = 'mini', // car
  Midi = 'midi', // suv
  Maxi = 'maxi', // van
  Scooter = 'scooter',
  Bus = 'bus',
  Truck = 'truck',
  Caravan = 'caravan',
}

export enum CarMultimedia {
  Touchscreen = 'touchscreen',
  Bluetooth = 'bluetooth',
  AndroidAuto = 'androidAuto',
  AppleCarPlay = 'appleCarPlay',
}

export enum GearboxType {
  Manual = 'manual',
  Automatic = 'automatic',
}

export enum FuelPolicy {
  LikeForLike = 'likeForlike',
  FreeTank = 'freeTank',
  FullToFull = 'fullToFull',
  FullToEmpty = 'FullToEmpty',
}

export enum BookingStatus {
  Void = 'void',
  Pending = 'pending',
  Deposit = 'deposit',
  Paid = 'paid',
  PaidInFull = 'paidInFull',
  Reserved = 'reserved',
  Cancelled = 'cancelled',
}

export enum Mileage {
  Limited = 'limited',
  Unlimited = 'unlimited',
}

export enum Availablity {
  Available = 'available',
  Unavailable = 'unavailable',
}

export enum RecordType {
  Admin = 'admin',
  Supplier = 'supplier',
  User = 'user',
  Car = 'car',
  Location = 'location',
  Country = 'country',
}

export enum PaymentGateway {
  PayPal = 'payPal',
  Stripe = 'stripe',
  MercadoPago = 'mercadopago',
}
export interface Booking {
  _id?: string
  supplier: string | User
  car: string | Car
  driver?: string | User
  pickupLocation: string | Location
  dropOffLocation: string | Location
  from: Date
  to: Date
  status: BookingStatus
  cancellation?: boolean
  amendments?: boolean
  theftProtection?: boolean
  collisionDamageWaiver?: boolean
  fullInsurance?: boolean
  additionalDriver?: boolean
  _additionalDriver?: string | AdditionalDriver
  cancelRequest?: boolean
  price?: number
  sessionId?: string
  paymentIntentId?: string
  customerId?: string
  expireAt?: Date
  isDeposit?: boolean
  isPayedInFull?: boolean
  paypalOrderId?: string
  odooOrderId?: number
  kmOut?: number
  fuelOut?: string
  picturesOut?: string[]
  signatureDriver?: string
  signatureRep?: string
  remarksOut?: string
  kmIn?: number
  fuelIn?: string
  picturesIn?: string[]
  signatureDriverIn?: string
  signatureRepIn?: string
  remarksIn?: string
  picturesOutVerified?: boolean
  picturesInVerified?: boolean
  verificationRemarks?: string
}

export interface CheckoutPayload {
  driver?: User
  booking?: Booking
  additionalDriver?: AdditionalDriver
  payLater: boolean
  sessionId?: string
  paymentIntentId?: string
  customerId?: string
  payPal?: boolean
}

export interface Filter {
  from?: Date
  dateBetween?: Date
  to?: Date
  keyword?: string
  pickupLocation?: string
  dropOffLocation?: string
}

export interface GetBookingsPayload {
  suppliers: string[]
  statuses: string[]
  user?: string
  car?: string
  filter?: Filter
}

export interface AdditionalDriver {
  fullName: string
  email: string
  phone: string
  birthDate?: Date
}

export interface UpsertBookingPayload {
  booking: Booking
  additionalDriver?: AdditionalDriver
}

export interface LocationName {
  language: string
  name: string
}

export interface CountryName {
  language: string
  name: string
}

export interface UpsertLocationPayload {
  country: string
  longitude?: number
  latitude?: number
  names: LocationName[]
  image?: string | null
  parkingSpots?: ParkingSpot[]
  supplier?: string
  parentLocation?: string
}

export interface UpdateSupplierPayload {
  _id: string
  fullName: string
  phone: string
  location: string
  bio: string
  payLater: boolean
  licenseRequired: boolean
  minimumRentalDays?: number
  priceChangeRate?: number
  supplierCarLimit?: number
  notifyAdminOnNewCar?: boolean
  blacklisted?: boolean
  clientType?: string | ClientType
}

export interface CreateCarPayload {
  loggedUser: string
  name: string
  licensePlate?: string
  supplier: string
  minimumAge: number
  locations: string[]

  // price fields
  hourlyPrice: number | null
  discountedHourlyPrice: number | null
  dailyPrice: number
  discountedDailyPrice: number | null
  biWeeklyPrice: number | null
  discountedBiWeeklyPrice: number | null
  weeklyPrice: number | null
  discountedWeeklyPrice: number | null
  monthlyPrice: number | null
  discountedMonthlyPrice: number | null
  // date based price
  isDateBasedPrice: boolean
  dateBasedPrices: DateBasedPrice[]

  deposit: number
  available: boolean
  fullyBooked?: boolean
  comingSoon?: boolean
  type: string
  gearbox: string
  aircon: boolean
  image?: string
  seats: number
  doors: number
  fuelPolicy: string
  mileage: number
  cancellation: number
  amendments: number
  theftProtection: number
  collisionDamageWaiver: number
  fullInsurance: number
  additionalDriver: number
  range: string
  multimedia: string[]
  rating?: number
  co2?: number
  blockOnPay?: boolean
}

export interface UpdateCarPayload extends CreateCarPayload {
  _id: string
}

export interface CarSpecs {
  aircon?: boolean,
  moreThanFourDoors?: boolean,
  moreThanFiveSeats?: boolean,
  diesel?: boolean,
}

export interface DateBasedPrice {
  _id?: string
  startDate: Date
  endDate: Date
  dailyPrice: number
}

export interface ParkingSpot {
  _id?: string
  longitude?: string
  latitude?: string
  name?: string
}

export interface Location {
  _id: string
  country: Country
  longitude?: number
  latitude?: number
  name: string
  image?: string
  parkingSpots?: ParkingSpot[]
  supplier?: string
  parentLocation?: string
}

export interface Country {
  _id: string
  name: string
}

export interface Notification {
  _id?: string
  user?: string
  message: string
  booking?: string
  car?: string
  isRead?: boolean
  createdAt?: Date
}

export interface User {
  _id?: string
  supplier?: string | User
  fullName: string
  email?: string
  phone?: string
  password?: string
  birthDate?: Date
  verified?: boolean
  verifiedAt?: Date
  active?: boolean
  language?: string
  enableEmailNotifications?: boolean
  avatar?: string
  bio?: string
  location?: string
  type?: string
  blacklisted?: boolean
  payLater?: boolean
  licenseRequired?: boolean
  license?: string | null
  minimumRentalDays?: number
  priceChangeRate?: number
  supplierCarLimit?: number
  notifyAdminOnNewCar?: boolean
  clientType?: string | ClientType
  contracts?: Contract[]
}

export interface Contract {
  _id?: string
  language: string
  file: string
}

export interface ClientType {
  _id?: string
  name: string
  displayName: string
  description?: string
  active: boolean
  privileges: {
    rentDiscount: number
  }
}

export interface Car {
  _id: string
  name: string
  licensePlate?: string
  supplier: User
  minimumAge: number
  locations: string[]
  hourlyPrice: number | null
  discountedHourlyPrice: number | null
  dailyPrice: number
  discountedDailyPrice: number | null
  biWeeklyPrice: number | null
  discountedBiWeeklyPrice: number | null
  weeklyPrice: number | null
  discountedWeeklyPrice: number | null
  monthlyPrice: number | null
  discountedMonthlyPrice: number | null
  isDateBasedPrice: boolean
  dateBasedPrices: DateBasedPrice[]
  deposit: number
  available: boolean
  fullyBooked?: boolean
  comingSoon?: boolean
  type: CarType
  gearbox: GearboxType
  aircon: boolean
  image?: string | null
  seats: number
  doors: number
  fuelPolicy: FuelPolicy
  mileage: number
  cancellation: number
  amendments: number
  theftProtection: number
  collisionDamageWaiver: number
  fullInsurance: number
  additionalDriver: number
  range: string
  multimedia: string[]
  rating?: number
  trips?: number
  co2?: number
  blockOnPay?: boolean
  price?: number
  clientDiscount?: number
}

export interface UpdateUserPayload {
  _id: string
  fullName: string
  phone?: string
  birthDate?: Date
  location?: string
  bio?: string
  blacklisted?: boolean
  payLater?: boolean
  licenseRequired?: boolean
  minimumRentalDays?: number
  priceChangeRate?: number
  supplierCarLimit?: number
  notifyAdminOnNewCar?: boolean
  clientType?: string | ClientType
}

export interface SignUpPayload {
  email: string
  password: string
  fullName: string
  phone?: string
  birthDate?: Date
  language?: string
}

export interface SignInPayload {
  email: string
  password: string
}

export interface VerifyEmailPayload {
  email: string
}

export interface ChangePasswordPayload {
  _id: string
  password: string
}

export interface ResetPasswordRequestPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  password: string
}

export interface CreatePaymentPayload {
  amount: number
  currency: string
  locale?: string
  receiptEmail?: string
  name?: string
  description?: string
  customerName?: string
}

export interface CreatePayPalOrderPayload {
  bookingId: string
  amount: number
  currency: string
  name: string
  description: string
}

export interface PriceChangeRate {
  _id?: string
  supplier: string
  value: number
}

export interface AvailabilityPayload {
  pickupLocation: string
  dropOffLocation?: string
  from: Date
  to: Date
}

export interface RentalLifecycleRecord {
  _id?: string
  booking: string | Booking
  state: 'reserved' | 'checked_out' | 'returned' | 'closed'
  checkedOutAt?: Date
  returnedAt?: Date
  closedAt?: Date
  updatedAt?: Date
}

export interface RentalLifecycleEvent {
  _id?: string
  booking: string | Booking
  from?: RentalLifecycleRecord['state']
  to: RentalLifecycleRecord['state']
  actor?: string
  source: 'admin' | 'laborsync' | 'backend' | 'test'
  createdAt?: Date
}

export interface CheckoutHandoverPayload {
  kmOut?: number
  fuelOut?: string
  picturesOut?: string[]
  signatureDriver?: string
  signatureRep?: string
  remarksOut?: string
}

export interface ReturnHandoverPayload {
  kmIn?: number
  fuelIn?: string
  picturesIn?: string[]
  signatureDriverIn?: string
  signatureRepIn?: string
  remarksIn?: string
}

export interface ClosureInspectionPayload {
  picturesOutVerified?: boolean
  picturesInVerified?: boolean
  verificationRemarks?: string
}
