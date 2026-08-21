import { Request, Response } from 'express'
import Car from '../models/Car'
import i18n from '../lang/i18n'
import * as logger from '../utils/logger'

const DEFAULT_PUBLIC_FLEET_SIZE = 4
const MAX_PUBLIC_FLEET_SIZE = 12

/**
 * Return a presentation-safe projection of the active rental fleet.
 *
 * This endpoint is deliberately NOT an availability endpoint. It does not
 * accept dates or locations and it does not expose prices, license plates or
 * supplier internals. Date/location availability remains owned by
 * /api/frontend-cars.
 */
export const getPublicFleet = async (req: Request, res: Response) => {
  try {
    const requestedSize = Number.parseInt(req.params.size || '', 10)
    const size = Number.isFinite(requestedSize)
      ? Math.min(Math.max(requestedSize, 1), MAX_PUBLIC_FLEET_SIZE)
      : DEFAULT_PUBLIC_FLEET_SIZE

    const cars = await Car.aggregate([
      {
        $match: {
          available: true,
          $and: [
            { $or: [{ fullyBooked: false }, { fullyBooked: null }] },
            { $or: [{ comingSoon: false }, { comingSoon: null }] },
          ],
        },
      },
      {
        $lookup: {
          from: 'User',
          localField: 'supplier',
          foreignField: '_id',
          as: 'supplier',
        },
      },
      { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: false } },
      { $match: { 'supplier.blacklisted': false } },
      { $sort: { updatedAt: -1, _id: 1 } },
      { $limit: size },
      {
        $project: {
          _id: 1,
          name: 1,
          image: 1,
          type: 1,
          gearbox: 1,
          seats: 1,
          doors: 1,
          aircon: 1,
          range: 1,
          multimedia: 1,
        },
      },
    ])

    res.json(cars)
  } catch (err) {
    logger.error(`[publicFleet.getPublicFleet] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}
