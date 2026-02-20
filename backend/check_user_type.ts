import 'dotenv/config'
import mongoose from 'mongoose'
import User from './src/models/User.js'

const run = async () => {
    try {
        await mongoose.connect(process.env.BC_DB_URI!)
        console.log('Connected to DB')

        const userId = '698cc17a79e8d819256d10ae'
        const user = await User.findById(userId)

        if (user) {
            console.log('User found:', user._id)
            console.log('User Type:', user.type)
            console.log('User details:', JSON.stringify(user, null, 2))
        } else {
            console.log('User not found in DB at all')
        }
    } catch (err) {
        console.error(err)
    } finally {
        await mongoose.connection.close()
    }
}

run()
