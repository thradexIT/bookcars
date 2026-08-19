import 'dotenv/config'
import mongoose from 'mongoose'

const run = async () => {
    try {
        await mongoose.connect(process.env.BC_DB_URI!)
        const db = mongoose.connection.db!

        const car = await db.collection('Car').findOne({ name: 'Chevrolet Suburban Premier - Executive Black' })
        const user = await db.collection('User').findOne({ _id: new mongoose.Types.ObjectId('698a13376c2d4a60763b76ec') })
        const clientType = await db.collection('ClientType').findOne({ _id: user?.clientType })

        console.log('=== NEW DISCOUNT LOGIC TEST ===\n')

        console.log('Car Prices:')
        console.log('  dailyPrice:', car?.dailyPrice)
        console.log('  biWeeklyPrice (3-day):', car?.biWeeklyPrice)
        console.log('  discountedDailyPrice:', car?.discountedDailyPrice)
        console.log('  discountedBiWeeklyPrice:', car?.discountedBiWeeklyPrice)

        console.log('\nClient Type:')
        console.log('  Name:', clientType?.name)
        console.log('  Discount:', clientType?.privileges?.rentDiscount + '%')

        console.log('\n=== CALCULATION (3 days) ===')

        // Simulate new logic
        const clientDiscount = clientType?.privileges?.rentDiscount || 0

        // Step 1: Use base 3-day price (with existing discount if any)
        const base3DayPrice = car?.discountedBiWeeklyPrice || car?.biWeeklyPrice || 0
        console.log('Step 1 - Base 3-day price:', base3DayPrice)

        // Step 2: Apply client discount
        const final3DayPrice = base3DayPrice * (1 - (clientDiscount / 100))
        console.log('Step 2 - Apply', clientDiscount + '% client discount:', final3DayPrice.toFixed(2))
        console.log('Per day:', (final3DayPrice / 3).toFixed(2))

        console.log('\n=== COMPARISON ===')
        console.log('If we charged daily rate:')
        const dailyRate = car?.discountedDailyPrice || car?.dailyPrice || 0
        const dailyTotal = dailyRate * 3
        console.log('  3 × $' + dailyRate + ' = $' + dailyTotal)
        console.log('  With ' + clientDiscount + '% discount: $' + (dailyTotal * (1 - (clientDiscount / 100))).toFixed(2))

        console.log('\nWith 3-day bulk price:')
        console.log('  $' + base3DayPrice + ' with ' + clientDiscount + '% discount = $' + final3DayPrice.toFixed(2))
        console.log('  Savings: $' + ((dailyTotal * (1 - (clientDiscount / 100))) - final3DayPrice).toFixed(2))

    } catch (err) {
        console.error(err)
    } finally {
        await mongoose.connection.close()
    }
}

run()
