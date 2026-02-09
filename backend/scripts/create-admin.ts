import 'dotenv/config'
import * as bookcarsTypes from '../../packages/bookcars-types/index'
import * as env from '../src/config/env.config'
import User from '../src/models/User'
import * as authHelper from '../src/utils/authHelper'
import * as databaseHelper from '../src/utils/databaseHelper'
import * as logger from '../src/utils/logger'

const createAdmin = async () => {
    try {
        await databaseHelper.connect(env.DB_URI, false, false)

        const email = 'admin@bookcars.ma'
        const password = 'B00kC4r5'

        let admin = await User.findOne({ email })
        if (admin) {
            logger.info('Admin user already exists.')
        } else {
            const passwordHash = await authHelper.hashPassword(password)
            admin = new User({
                email,
                password: passwordHash,
                fullName: 'Admin',
                language: 'en',
                type: bookcarsTypes.UserType.Admin,
                birthDate: new Date(1980, 1, 1),
                phone: '00000000',
                active: true,
                verified: true,
            })
            await admin.save()
            logger.info('Admin user created successfully.')
        }

        await databaseHelper.close()
        process.exit(0)
    } catch (err) {
        logger.error('Error creating admin user:', err)
        process.exit(1)
    }
}

createAdmin()
