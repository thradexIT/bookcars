import { Request, Response } from 'express'
import * as bookcarsTypes from ':bookcars-types'
import Booking from '../models/Booking'
import User from '../models/User'
import * as env from '../config/env.config'
import * as logger from '../utils/logger'

/**
 * Return the supplier projection required by the Admin bookings surface.
 *
 * Authority rule: booking visibility must be derived from bookings, not from
 * supplier presentation completeness (avatar/logo) or current active cars.
 */
export const getAdminBookingSuppliers = async (_req: Request, res: Response) => {
  try {
    const supplierIds = await Booking.distinct('supplier', { supplier: { $ne: null } })

    if (supplierIds.length === 0) {
      res.json([])
      return
    }

    const suppliers = await User.find({
      _id: { $in: supplierIds },
      type: bookcarsTypes.UserType.Supplier,
    })
      .select('_id fullName avatar')
      .sort({ fullName: 1, _id: 1 })
      .collation({ locale: env.DEFAULT_LANGUAGE, strength: 2 })
      .lean()

    res.json(suppliers.map(({ _id, fullName, avatar }) => ({ _id, fullName, avatar })))
  } catch (err) {
    logger.error('[adminBookingSupplier.getAdminBookingSuppliers] Failed to derive booking suppliers', err)
    res.status(400).send('Failed to load booking suppliers')
  }
}
