import 'dotenv/config'
import mongoose from 'mongoose'

const run = async () => {
    try {
        await mongoose.connect(process.env.BC_DB_URI!)
        const db = mongoose.connection.db!

        const car = await db.collection('Car').findOne({ name: 'Chevrolet Suburban Premier - Executive Black' })
        const user = await db.collection('User').findOne({ _id: new mongoose.Types.ObjectId('698a13376c2d4a60763b76ec') })
        const clientType = await db.collection('ClientType').findOne({ _id: user?.clientType })

        console.log('=== Current Database State ===')
        console.log('\nCar Base Prices:')
        console.log('  dailyPrice:', car?.dailyPrice)
        console.log('  biWeeklyPrice (3-day):', car?.biWeeklyPrice)
        console.log('  weeklyPrice:', car?.weeklyPrice)

        console.log('\nCar Discounted Prices (existing):')
        console.log('  discountedDailyPrice:', car?.discountedDailyPrice)
        console.log('  discountedBiWeeklyPrice:', car?.discountedBiWeeklyPrice)

        console.log('\nUser Client Type:')
        console.log('  Name:', clientType?.name)
        console.log('  Discount:', clientType?.privileges?.rentDiscount + '%')

        console.log('\n=== Expected Calculation (Backend will apply) ===')
        const discount = clientType?.privileges?.rentDiscount || 0
        const multiplier = 1 - (discount / 100)

        const baseBiWeekly = car?.discountedBiWeeklyPrice || car?.biWeeklyPrice || 0
        const finalBiWeekly = baseBiWeekly * multiplier

        console.log('Base 3-day price:', baseBiWeekly)
        console.log('Client discount multiplier:', multiplier)
        console.log('Final 3-day price:', finalBiWeekly.toFixed(2))
        console.log('Per day:', (finalBiWeekly / 3).toFixed(2))

    } catch (err) {
        console.error(err)
    } finally {
        await mongoose.connection.close()
    }
}

run()
