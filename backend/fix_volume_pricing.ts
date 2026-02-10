import 'dotenv/config'
import mongoose from 'mongoose'

const run = async () => {
    try {
        await mongoose.connect(process.env.BC_DB_URI!)
        const db = mongoose.connection.db!

        console.log('=== FIXING VOLUME PRICING ===\n')

        // Current incorrect pricing
        console.log('Current pricing for Chevrolet Suburban:')
        const car = await db.collection('Car').findOne({ name: 'Chevrolet Suburban Premier - Executive Black' })
        console.log('  dailyPrice:', car?.dailyPrice)
        console.log('  biWeeklyPrice (3 days):', car?.biWeeklyPrice)
        console.log('  weeklyPrice (7 days):', car?.weeklyPrice)
        console.log('  monthlyPrice (30 days):', car?.monthlyPrice)

        console.log('\n=== CORRECT LOGIC ===')
        console.log('Volume prices should be TOTAL for the period, not per-day rate')
        console.log('Example:')
        console.log('  Daily rate: $250/day')
        console.log('  3-day rate: $220/day → biWeeklyPrice should be $220 × 3 = $660')
        console.log('  7-day rate: $200/day → weeklyPrice should be $200 × 7 = $1,400')
        console.log('  30-day rate: $180/day → monthlyPrice should be $180 × 30 = $5,400')

        console.log('\n=== APPLYING FIX ===')

        // Fix: biWeeklyPrice should be the TOTAL for 3 days
        const dailyRate = 250
        const threeDayRate = 220 // per day when renting 3+ days
        const sevenDayRate = 200 // per day when renting 7+ days
        const thirtyDayRate = 180 // per day when renting 30+ days

        const correctBiWeeklyPrice = threeDayRate * 3 // $660
        const correctWeeklyPrice = sevenDayRate * 7 // $1,400
        const correctMonthlyPrice = thirtyDayRate * 30 // $5,400

        const result = await db.collection('Car').updateOne(
            { name: 'Chevrolet Suburban Premier - Executive Black' },
            {
                $set: {
                    dailyPrice: dailyRate,
                    biWeeklyPrice: correctBiWeeklyPrice,
                    weeklyPrice: correctWeeklyPrice,
                    monthlyPrice: correctMonthlyPrice,
                    discountedDailyPrice: dailyRate,
                    discountedBiWeeklyPrice: correctBiWeeklyPrice,
                    discountedWeeklyPrice: correctWeeklyPrice,
                    discountedMonthlyPrice: correctMonthlyPrice
                }
            }
        )

        console.log('Updated:', result.modifiedCount, 'car(s)')

        console.log('\n=== VERIFICATION ===')
        const updatedCar = await db.collection('Car').findOne({ name: 'Chevrolet Suburban Premier - Executive Black' })
        console.log('New pricing:')
        console.log('  dailyPrice:', updatedCar?.dailyPrice, '($' + dailyRate + '/day)')
        console.log('  biWeeklyPrice:', updatedCar?.biWeeklyPrice, '($' + threeDayRate + '/day × 3 days)')
        console.log('  weeklyPrice:', updatedCar?.weeklyPrice, '($' + sevenDayRate + '/day × 7 days)')
        console.log('  monthlyPrice:', updatedCar?.monthlyPrice, '($' + thirtyDayRate + '/day × 30 days)')

        console.log('\n=== EXPECTED PRICES ===')
        console.log('For 3 days with 50% client discount:')
        console.log('  Base: $660')
        console.log('  With 50% discount: $330')
        console.log('  Per day: $110')

    } catch (err) {
        console.error(err)
    } finally {
        await mongoose.connection.close()
    }
}

run()
