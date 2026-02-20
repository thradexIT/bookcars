import 'dotenv/config'
import mongoose from 'mongoose'
import User from './src/models/User.js'

const run = async () => {
    try {
        await mongoose.connect(process.env.BC_DB_URI!)
        console.log('Connected to DB')

        const users = await User.find({})
        console.log(`Found ${users.length} users.`)
        users.forEach(u => {
            console.log(`- ${u._id} (${u.email}) [${u.type}]`)
        })

    } catch (err) {
        console.error(err)
    } finally {
        await mongoose.connection.close()
    }
}

run()
