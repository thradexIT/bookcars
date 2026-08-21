import 'dotenv/config'
import * as bookcarsTypes from ':bookcars-types'
import * as env from '../config/env.config'
import * as databaseHelper from '../utils/databaseHelper'
import * as logger from '../utils/logger'
import * as authHelper from '../utils/authHelper'
import User from '../models/User'
import Country from '../models/Country'
import Location from '../models/Location'
import LocationValue from '../models/LocationValue'
import Car from '../models/Car'

const DEFAULT_DEMO_PASSWORD = process.env.MITOS_DEMO_PASSWORD || 'B00kC4r5'
const DEFAULT_CUSTOMER_EMAIL = process.env.MITOS_DEMO_CUSTOMER_EMAIL || 'jdoe@mitos.pe'
const DEFAULT_ADMIN_EMAIL = process.env.MITOS_DEMO_ADMIN_EMAIL || 'admin@mitos.pe'

const isSafeDevDatabase = () => {
  const uri = env.DB_URI || ''
  return uri.includes('localhost') || uri.includes('127.0.0.1') || uri.includes('mongo:') || process.env.MITOS_ALLOW_SEED === 'true'
}

const ensureValue = async (language: string, value: string) => {
  const existing = await LocationValue.findOne({ language, value })
  if (existing) return existing
  return new LocationValue({ language, value }).save()
}

const ensureDemoUser = async ({
  email,
  fullName,
  type,
  passwordHash,
}: {
  email: string
  fullName: string
  type: bookcarsTypes.UserType
  passwordHash: string
}) => User.findOneAndUpdate(
  { email },
  {
    $set: {
      fullName,
      password: passwordHash,
      language: 'es',
      type,
      active: true,
      verified: true,
      verifiedAt: new Date(),
      blacklisted: false,
      payLater: true,
      location: 'Lima, Perú',
    },
    $unset: {
      expireAt: 1,
    },
  },
  { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
)

try {
  if (!isSafeDevDatabase()) {
    logger.error('MITOS DEV seed refused: target DB does not look local. Set MITOS_ALLOW_SEED=true only when explicitly intended.')
    process.exit(1)
  }

  const connected = await databaseHelper.connect(env.DB_URI, env.DB_SSL, env.DB_DEBUG)
  if (!connected) {
    logger.error('MITOS DEV seed failed to connect to database')
    process.exit(1)
  }

  const demoPasswordHash = await authHelper.hashPassword(DEFAULT_DEMO_PASSWORD)

  await ensureDemoUser({
    email: DEFAULT_CUSTOMER_EMAIL,
    fullName: 'John Doe',
    type: bookcarsTypes.UserType.User,
    passwordHash: demoPasswordHash,
  })

  await ensureDemoUser({
    email: DEFAULT_ADMIN_EMAIL,
    fullName: 'MITOS Admin',
    type: bookcarsTypes.UserType.Admin,
    passwordHash: demoPasswordHash,
  })

  const supplier = await User.findOneAndUpdate(
    { email: 'mitos.dev@local.test' },
    {
      $set: {
        fullName: 'MITOS Rent a Car',
        language: 'es',
        type: bookcarsTypes.UserType.Supplier,
        active: true,
        verified: true,
        blacklisted: false,
        payLater: true,
        location: 'Lima, Perú',
        bio: 'Local development supplier used to exercise the Mitos rental funnel.',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
  )

  let country = await Country.findOne({ supplier: supplier._id })
  if (!country) {
    const countryEs = await ensureValue('es', 'Perú')
    const countryEn = await ensureValue('en', 'Peru')
    country = await new Country({
      supplier: supplier._id,
      values: [countryEs._id, countryEn._id],
    }).save()
  }

  let location = await Location.findOne({ supplier: supplier._id, country: country._id })
  if (!location) {
    const locationEs = await ensureValue('es', 'La Molina, Lima')
    const locationEn = await ensureValue('en', 'La Molina, Lima')
    location = await new Location({
      supplier: supplier._id,
      country: country._id,
      values: [locationEs._id, locationEn._id],
      parkingSpots: [],
    }).save()
  }

  const commonCar = {
    supplier: supplier._id,
    minimumAge: Math.max(env.MINIMUM_AGE, 21),
    locations: [location._id],
    deposit: 0,
    available: true,
    fullyBooked: false,
    comingSoon: false,
    type: bookcarsTypes.CarType.Gasoline,
    gearbox: bookcarsTypes.GearboxType.Automatic,
    aircon: true,
    seats: 5,
    doors: 4,
    fuelPolicy: bookcarsTypes.FuelPolicy.FullToFull,
    mileage: 0,
    cancellation: 0,
    amendments: 0,
    theftProtection: 0,
    collisionDamageWaiver: 0,
    fullInsurance: 0,
    additionalDriver: 0,
    multimedia: [bookcarsTypes.CarMultimedia.Bluetooth, bookcarsTypes.CarMultimedia.Touchscreen],
    isDateBasedPrice: false,
    dateBasedPrices: [],
    blockOnPay: false,
  }

  await Car.findOneAndUpdate(
    { supplier: supplier._id, name: 'Toyota Yaris 2025/26' },
    {
      $set: {
        ...commonCar,
        name: 'Toyota Yaris 2025/26',
        dailyPrice: 35,
        range: bookcarsTypes.CarRange.Mini,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
  )

  await Car.findOneAndUpdate(
    { supplier: supplier._id, name: 'Toyota Raize' },
    {
      $set: {
        ...commonCar,
        name: 'Toyota Raize',
        dailyPrice: 45,
        range: bookcarsTypes.CarRange.Midi,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
  )

  logger.info(`MITOS DEV seed ready: demo customer ${DEFAULT_CUSTOMER_EMAIL}, demo admin ${DEFAULT_ADMIN_EMAIL}, supplier, Peru, La Molina, Toyota Yaris 2025/26 and Toyota Raize`)
  logger.info('DEV ONLY: demo credentials and seeded prices are local test fixtures, not production identities or price authority.')
  process.exit(0)
} catch (err) {
  logger.error('MITOS DEV seed failed:', err)
  process.exit(1)
}
