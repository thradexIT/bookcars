
import 'dotenv/config'
import mongoose from 'mongoose'

const run = async () => {
    try {
        const dbUri = process.env.BC_DB_URI
        if (!dbUri) {
            throw new Error('BC_DB_URI not found in .env')
        }
        await mongoose.connect(dbUri)
        console.log('Connected to DB')
        if (!mongoose.connection.db) {
            throw new Error('Database not connected')
        }
        const db = mongoose.connection.db

        const clients = await db.collection('ClientType').find({}).toArray()

        // 1. Fetch the user (from license filename)
        // The user provided license file: 698a13376c2d4a60763b76ec.jpeg. UUID is likely the ID.
        const userId = '698a13376c2d4a60763b76ec'
        // Use raw collection access
        const user = await db.collection('User').findOne({ _id: new mongoose.Types.ObjectId(userId) })

        let clientType = null
        if (!user) {
            console.log('User not found:', userId)
            clientType = clients.find(c => c.name === 'Insurance')
            if (clientType) {
                console.log('Found ClientType (Direct):', clientType)
            }
        } else {
            console.log('Found User:', user._id)
            if (user.clientType) {
                clientType = await db.collection('ClientType').findOne({ _id: user.clientType })
                console.log('User ClientType:', clientType)
            } else {
                console.log('User has no clientType field')
            }
        }

        // 2. Fetch the car "Chevrolet Suburban Premier - Executive Black"
        const car = await db.collection('Car').findOne({ name: 'Chevrolet Suburban Premier - Executive Black' })
        if (!car) {
            console.log('Car not found')
            return
        }

        const supplier = await db.collection('User').findOne({ _id: car.supplier })

        console.log('--------------------------------------------------')
        console.log('Car Name:', car.name)
        console.log('Car Daily Price (DB Base):', car.dailyPrice)
        console.log('Discounted Daily Price (Existing in DB?):', car.discountedDailyPrice)
        console.log('Supplier Price Change Rate:', supplier ? supplier.priceChangeRate : 'N/A')

        // 3. Simulate Discount Logic
        let discount = 0
        // UPDATED: Check for privileges.rentDiscount
        if (clientType && clientType.active) {
            if (clientType.privileges && clientType.privileges.rentDiscount) {
                discount = clientType.privileges.rentDiscount
            } else if (clientType.discount) {
                discount = clientType.discount // Fallback
            }
        }
        console.log('User Discount:', discount)

        // My logic: 1 - (discount / 100)
        const discountMultiplier = 1 - (discount / 100)
        const discountedDailyPrice = (car.discountedDailyPrice || car.dailyPrice) * discountMultiplier

        console.log('Calculated Discounted Daily Price (Stacked):', discountedDailyPrice)

        // 4. Simulate Markup Logic (Frontend Display)
        const priceChangeRate = (supplier && supplier.priceChangeRate) || 0
        const markupMultiplier = 1 + (priceChangeRate / 100)

        const finalOriginalPrice = car.dailyPrice * markupMultiplier

        // logic in Checkout uses the discounted price from backend as base?
        // Actually, Checkout just displays what backend sends.
        // Backend sends 'car' with 'discountedDailyPrice' already calculated.
        // So if backend sends 187, frontend displays 187.

        const finalDisplayPrice = discountedDailyPrice // * markupMultiplier? No, backend applies markup? 
        // Wait, backend 'getCar' doesn't apply markup to price?
        // 'getFrontendCars' and 'getCar' return raw prices?
        // helper.calculateTotalPrice in frontend adds markup.

        const finalDiscountedPrice = discountedDailyPrice * markupMultiplier

        console.log('Multiplier for Markup:', markupMultiplier)
        console.log('Final Display Price (Original):', finalOriginalPrice)
        console.log('Final Display Price (Discounted):', finalDiscountedPrice)

        console.log('Percent Drop:', (finalOriginalPrice - finalDiscountedPrice) / finalOriginalPrice * 100, '%')
    } catch (err) {
        console.error(err)
    } finally {
        await mongoose.connection.close()
    }
}

run()
