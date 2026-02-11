import 'dotenv/config'
import mongoose from 'mongoose'
import User from './src/models/User.js'
import Car from './src/models/Car.js'
import * as authHelper from './src/utils/authHelper.js'
import * as env from './src/config/env.config.js'

const run = async () => {
    try {
        await mongoose.connect(process.env.BC_DB_URI!)

        console.log('=== DEBUGGING CLIENT DISCOUNT ===\n')

        // Get user with client type
        const user = await User.findById('698a13376c2d4a60763b76ec').populate<{ clientType: env.ClientType }>('clientType')

        console.log('User:', user?.email)
        console.log('Client Type:', user?.clientType?.name)
        console.log('Client Type Active:', user?.clientType?.active)
        console.log('Client Type Privileges:', user?.clientType?.privileges)
        console.log('Rent Discount:', user?.clientType?.privileges?.rentDiscount + '%')

        // Simulate what backend does
        let userDiscount = 0
        if (user && user.clientType && user.clientType.active && user.clientType.privileges) {
            userDiscount = user.clientType.privileges.rentDiscount
        }

        console.log('\nCalculated userDiscount:', userDiscount)

        // Get a car
        const car = await Car.findOne({ name: 'Chevrolet Suburban Premier - Executive Black' }).lean()

        console.log('\nCar:', car?.name)
        console.log('Car has clientDiscount field?', 'clientDiscount' in (car || {}))

        // Simulate setting clientDiscount
        if (userDiscount > 0 && car) {
            (car as any).clientDiscount = userDiscount
            console.log('Set car.clientDiscount to:', (car as any).clientDiscount)
        }

        console.log('\nFinal car object has clientDiscount?', 'clientDiscount' in (car || {}))
        console.log('Value:', (car as any)?.clientDiscount)
    } catch (err) {
        console.error(err)
    } finally {
        await mongoose.connection.close()
    }
}

run()
