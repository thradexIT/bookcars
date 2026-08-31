import mongoose from 'mongoose'
import { Request, Response } from 'express'
import * as bookcarsTypes from ':bookcars-types'
import Car from '../models/Car'
import Location from '../models/Location'
import User from '../models/User'
import i18n from '../lang/i18n'
import * as env from '../config/env.config'
import * as helper from '../utils/helper'
import * as logger from '../utils/logger'
import * as authHelper from '../utils/authHelper'

/**
 * Booking states that make a car unavailable for an overlapping rental period.
 *
 * This list intentionally mirrors bookingController.checkout. Customer search must
 * never advertise a car that checkout would reject as already booked.
 */
export const ACTIVE_BOOKING_STATUSES = [
  bookcarsTypes.BookingStatus.Pending,
  bookcarsTypes.BookingStatus.Deposit,
  bookcarsTypes.BookingStatus.Paid,
  bookcarsTypes.BookingStatus.PaidInFull,
  bookcarsTypes.BookingStatus.Reserved,
]

/**
 * Get Cars available for rental.
 *
 * This is the Mitos customer availability authority. It preserves the recovered
 * BookCars filtering/pricing/pagination behavior while making date conflicts use
 * the same active-status and interval semantics as checkout.
 *
 * Half-open interval rule:
 *   booking.from < requested.to && booking.to > requested.from
 *
 * A booking ending exactly when the requested rental starts does not overlap.
 */
export const getFrontendCars = async (req: Request, res: Response) => {
  try {
    const { body }: { body: bookcarsTypes.GetCarsPayload } = req
    const page = Number.parseInt(req.params.page, 10)
    const size = Number.parseInt(req.params.size, 10)
    const suppliers = body.suppliers!.map((id) => new mongoose.Types.ObjectId(id))
    const pickupLocation = new mongoose.Types.ObjectId(body.pickupLocation)
    const {
      carType,
      gearbox,
      mileage,
      fuelPolicy,
      deposit,
      carSpecs,
      ranges,
      multimedia,
      rating,
      seats,
      from,
      to,
      includeAlreadyBookedCars,
      includeComingSoonCars,
    } = body

    if (!from) {
      throw new Error('from date is required')
    }

    if (!to) {
      throw new Error('to date is required')
    }

    const requestedFrom = new Date(from)
    const requestedTo = new Date(to)

    if (Number.isNaN(requestedFrom.getTime()) || Number.isNaN(requestedTo.getTime()) || requestedFrom >= requestedTo) {
      throw new Error('invalid rental period')
    }

    // Include pickupLocation and child locations in search results.
    const locIds = await Location.find({
      $or: [
        { _id: pickupLocation },
        { parentLocation: pickupLocation },
      ],
    }).select('_id').lean()

    const locationIds = locIds.map((loc) => loc._id)

    const $match: mongoose.QueryFilter<bookcarsTypes.Car> = {
      $and: [
        { supplier: { $in: suppliers } },
        { locations: { $in: locationIds } },
        { type: { $in: carType } },
        { gearbox: { $in: gearbox } },
        { available: true },
        { fullyBooked: { $in: [false, null] } },
      ],
    }

    // This flag preserves the recovered static fullyBooked presentation behavior.
    // It does NOT bypass real date-conflict authority below.
    if (!includeAlreadyBookedCars) {
      $match.$and!.push({ $or: [{ fullyBooked: false }, { fullyBooked: null }] })
    }

    if (!includeComingSoonCars) {
      $match.$and!.push({ $or: [{ comingSoon: false }, { comingSoon: null }] })
    }

    if (fuelPolicy) {
      $match.$and!.push({ fuelPolicy: { $in: fuelPolicy } })
    }

    if (carSpecs) {
      if (carSpecs.aircon) {
        $match.$and!.push({ aircon: true })
      }
      if (carSpecs.moreThanFourDoors) {
        $match.$and!.push({ doors: { $gt: 4 } })
      }
      if (carSpecs.moreThanFiveSeats) {
        $match.$and!.push({ seats: { $gt: 5 } })
      }
    }

    if (mileage) {
      if (mileage.length === 1 && mileage[0] === bookcarsTypes.Mileage.Limited) {
        $match.$and!.push({ mileage: { $gt: -1 } })
      } else if (mileage.length === 1 && mileage[0] === bookcarsTypes.Mileage.Unlimited) {
        $match.$and!.push({ mileage: -1 })
      } else if (mileage.length === 0) {
        res.json([{ resultData: [], pageInfo: [] }])
        return
      }
    }

    if (deposit && deposit > -1) {
      $match.$and!.push({ deposit: { $lte: deposit } })
    }

    if (ranges) {
      $match.$and!.push({ range: { $in: ranges } })
    }

    if (multimedia && multimedia.length > 0) {
      for (const multimediaOption of multimedia) {
        $match.$and!.push({ multimedia: multimediaOption })
      }
    }

    if (rating && rating > -1) {
      $match.$and!.push({ rating: { $gte: rating } })
    }

    if (seats && seats > -1) {
      if (seats === 6) {
        $match.$and!.push({ seats: { $gt: 5 } })
      } else {
        $match.$and!.push({ seats })
      }
    }

    let $supplierMatch: mongoose.QueryFilter<any> = {}
    const days = helper.days(from, to)
    if (days) {
      $supplierMatch = { $or: [{ 'supplier.minimumRentalDays': { $lte: days } }, { 'supplier.minimumRentalDays': null }] }
    }

    const data = await Car.aggregate(
      [
        { $match },
        {
          $lookup: {
            from: 'User',
            let: { userId: '$supplier' },
            pipeline: [
              {
                $match: {
                  $and: [{ $expr: { $eq: ['$_id', '$$userId'] } }, { blacklisted: false }],
                },
              },
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                  avatar: 1,
                  priceChangeRate: 1,
                },
              },
            ],
            as: 'supplier',
          },
        },
        { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: false } },
        { $match: $supplierMatch },
        {
          $lookup: {
            from: 'DateBasedPrice',
            let: { dateBasedPrices: '$dateBasedPrices' },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ['$_id', '$$dateBasedPrices'] },
                },
              },
            ],
            as: 'dateBasedPrices',
          },
        },

        // Availability authority -------------------------------------------------
        // Match checkout's conflict rule exactly:
        //   same car
        //   active booking state
        //   booking.from < requested.to
        //   booking.to   > requested.from
        // Any matching booking removes the car from customer search, regardless
        // of the legacy blockOnPay presentation/config flag.
        {
          $lookup: {
            from: 'Booking',
            let: { carId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$car', '$$carId'] },
                      { $lt: ['$from', requestedTo] },
                      { $gt: ['$to', requestedFrom] },
                      { $in: ['$status', ACTIVE_BOOKING_STATUSES] },
                    ],
                  },
                },
              },
            ],
            as: 'overlappingBookings',
          },
        },
        {
          $match: {
            $expr: { $eq: [{ $size: '$overlappingBookings' }, 0] },
          },
        },
        // End availability authority ---------------------------------------------

        // Recovered supplierCarLimit behavior.
        {
          $addFields: {
            maxAllowedCars: { $ifNull: ['$supplier.supplierCarLimit', Number.MAX_SAFE_INTEGER] },
          },
        },
        {
          $group: {
            _id: '$supplier._id',
            supplierData: { $first: '$supplier' },
            cars: { $push: '$$ROOT' },
            maxAllowedCars: { $first: '$maxAllowedCars' },
          },
        },
        {
          $project: {
            supplier: '$supplierData',
            cars: {
              $cond: {
                if: { $eq: ['$maxAllowedCars', 0] },
                then: [],
                else: { $slice: ['$cars', 0, { $min: [{ $size: '$cars' }, '$maxAllowedCars'] }] },
              },
            },
          },
        },
        { $unwind: '$cars' },
        {
          $group: {
            _id: '$cars._id',
            car: { $first: '$cars' },
          },
        },
        { $replaceRoot: { newRoot: '$car' } },
        { $sort: { dailyPrice: 1, _id: 1 } },
        {
          $facet: {
            resultData: [
              { $skip: (page - 1) * size },
              { $limit: size },
            ],
            pageInfo: [
              { $count: 'totalRecords' },
            ],
          },
        },
      ],
      { collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } },
    )

    if (data.length > 0 && data[0].resultData.length > 0) {
      let userDiscount = 0
      let token = req.headers[env.X_ACCESS_TOKEN] as string

      if (!token) {
        token = req.signedCookies[env.FRONTEND_AUTH_COOKIE_NAME] as string
      }

      if (token) {
        try {
          const sessionData = await authHelper.decryptJWT(token)
          if (sessionData && helper.isValidObjectId(sessionData.id)) {
            const user = await User.findById(sessionData.id).populate<{ clientType: env.ClientType }>('clientType')
            if (user && user.clientType && user.clientType.active && user.clientType.privileges) {
              userDiscount = user.clientType.privileges.rentDiscount
            }
          }
        } catch {
          // Search remains public if an optional auth token is invalid/expired.
        }
      }

      if (userDiscount > 0) {
        for (const car of data[0].resultData) {
          car.clientDiscount = userDiscount
        }
      }
    }

    res.json(data)
  } catch (err) {
    logger.error(`[mitosAvailability.getFrontendCars] ${i18n.t('DB_ERROR')} ${req.query.s}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}
