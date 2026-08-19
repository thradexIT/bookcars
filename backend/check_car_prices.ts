import 'dotenv/config'
import mongoose from 'mongoose'

const run = async () => {
    try {
        await mongoose.connect(process.env.BC_DB_URI!)
        const db = mongoose.connection.db!
        const car = await db.collection('Car').findOne({ name: 'Chevrolet Suburban Premier - Executive Black' })

        if (car) {
            console.log('Car Prices:')
            console.log('dailyPrice:', car.dailyPrice)
            console.log('biWeeklyPrice:', car.biWeeklyPrice)
            console.log('weeklyPrice:', car.weeklyPrice)
            console.log('monthlyPrice:', car.monthlyPrice)
            console.log('discountedDailyPrice:', car.discountedDailyPrice)
            console.log('discountedBiWeeklyPrice:', car.discountedBiWeeklyPrice)
        } else {
            console.log('Car not found')
        }
    } catch (err) {
        console.error(err)
    } finally {
        await mongoose.connection.close()
    }
}

run()
