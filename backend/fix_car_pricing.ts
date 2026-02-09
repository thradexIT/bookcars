import 'dotenv/config'
import mongoose from 'mongoose'

const run = async () => {
    try {
        await mongoose.connect(process.env.BC_DB_URI!)
        const db = mongoose.connection.db!

        // Update the car's biWeeklyPrice to $220 (3-day bulk price)
        const result = await db.collection('Car').updateOne(
            { name: 'Chevrolet Suburban Premier - Executive Black' },
            {
                $set: {
                    biWeeklyPrice: 220  // 3-day price should be $220, not $250
                }
            }
        )

        console.log('Updated car pricing:', result.modifiedCount, 'document(s)')

        // Verify
        const car = await db.collection('Car').findOne({ name: 'Chevrolet Suburban Premier - Executive Black' })
        console.log('\nVerification:')
        console.log('dailyPrice:', car?.dailyPrice)
        console.log('biWeeklyPrice:', car?.biWeeklyPrice, '(3-day bulk price)')
        console.log('discountedDailyPrice:', car?.discountedDailyPrice)
        console.log('discountedBiWeeklyPrice:', car?.discountedBiWeeklyPrice)

    } catch (err) {
        console.error(err)
    } finally {
        await mongoose.connection.close()
    }
}

run()
