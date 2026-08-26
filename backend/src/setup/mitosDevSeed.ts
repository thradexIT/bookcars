import 'dotenv/config'
import path from 'node:path'
import asyncFs from 'node:fs/promises'
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

const MITOS_SUPPLIER_AVATAR = 'mitos-dev-supplier.svg'
const MITOS_YARIS_IMAGE = 'mitos-dev-toyota-yaris.svg'
const MITOS_RAIZE_IMAGE = 'mitos-dev-toyota-raize.svg'

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

const ensureSvgFixture = async (directory: string, filename: string, content: string) => {
  await asyncFs.mkdir(directory, { recursive: true })
  await asyncFs.writeFile(path.join(directory, filename), content, 'utf8')
  return filename
}

const supplierSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300" role="img" aria-label="MITOS Rent a Car DEV fixture">
  <rect width="600" height="300" rx="36" fill="#012063"/>
  <circle cx="105" cy="150" r="62" fill="#1741ff"/>
  <path d="M69 169h72l-11-39H82z" fill="#fff" opacity=".96"/>
  <circle cx="88" cy="171" r="12" fill="#012063"/>
  <circle cx="123" cy="171" r="12" fill="#012063"/>
  <text x="195" y="132" fill="#fff" font-family="Arial, sans-serif" font-size="52" font-weight="800">MITOS</text>
  <text x="195" y="178" fill="#dbe5ff" font-family="Arial, sans-serif" font-size="25">Rent a Car · Lima</text>
  <text x="195" y="216" fill="#ffd400" font-family="Arial, sans-serif" font-size="18" font-weight="700">DEV FIXTURE</text>
</svg>`

const carSvg = (model: string, accent: string) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760" role="img" aria-label="${model} Mitos DEV fixture">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#f7f9ff"/>
      <stop offset="1" stop-color="#e7edff"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="760" rx="48" fill="url(#bg)"/>
  <rect x="54" y="54" width="1092" height="652" rx="38" fill="#fff" stroke="#d8e2ff" stroke-width="4"/>
  <text x="100" y="145" fill="#012063" font-family="Arial, sans-serif" font-size="44" font-weight="800">MITOS RENT A CAR</text>
  <text x="100" y="205" fill="#40527d" font-family="Arial, sans-serif" font-size="28">${model}</text>
  <g transform="translate(150 250)">
    <path d="M80 245c22-94 63-151 145-173 79-21 255-23 373-8 76 10 134 47 181 120l56 18c38 12 61 45 61 85v48H16v-50c0-38 26-72 64-80z" fill="${accent}"/>
    <path d="M270 93h261c71 0 118 30 162 91H215c18-42 32-67 55-91z" fill="#cbd8ff" opacity=".95"/>
    <path d="M386 94v90" stroke="#fff" stroke-width="9" opacity=".8"/>
    <circle cx="207" cy="335" r="73" fill="#111a32"/>
    <circle cx="207" cy="335" r="38" fill="#e7ecf8"/>
    <circle cx="715" cy="335" r="73" fill="#111a32"/>
    <circle cx="715" cy="335" r="38" fill="#e7ecf8"/>
    <rect x="758" y="223" width="91" height="20" rx="10" fill="#ffd400"/>
  </g>
  <rect x="100" y="645" width="220" height="42" rx="21" fill="#012063"/>
  <text x="128" y="674" fill="#fff" font-family="Arial, sans-serif" font-size="20" font-weight="700">DEV FIXTURE · NO FOTO</text>
</svg>`

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

  await ensureSvgFixture(env.CDN_USERS, MITOS_SUPPLIER_AVATAR, supplierSvg)
  await ensureSvgFixture(env.CDN_CARS, MITOS_YARIS_IMAGE, carSvg('Toyota Yaris 2025/26', '#1741ff'))
  await ensureSvgFixture(env.CDN_CARS, MITOS_RAIZE_IMAGE, carSvg('Toyota Raize', '#012063'))

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
        bio: 'Proveedor local de desarrollo para validar el flujo de alquiler de Mitos.',
        avatar: MITOS_SUPPLIER_AVATAR,
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
        image: MITOS_YARIS_IMAGE,
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
        image: MITOS_RAIZE_IMAGE,
        dailyPrice: 45,
        range: bookcarsTypes.CarRange.Midi,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
  )

  logger.info(`MITOS DEV seed ready: demo customer ${DEFAULT_CUSTOMER_EMAIL}, demo admin ${DEFAULT_ADMIN_EMAIL}, supplier, Peru, La Molina, Toyota Yaris 2025/26 and Toyota Raize`)
  logger.info('MITOS DEV fixture assets ready: supplier avatar + Yaris/Raize SVG cards written to CDN.')
  logger.info('DEV ONLY: demo credentials, fixture assets and seeded prices are local test fixtures, not production identities, photos or price authority.')
  process.exit(0)
} catch (err) {
  logger.error('MITOS DEV seed failed:', err)
  process.exit(1)
}
