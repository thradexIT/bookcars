
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
        const db = mongoose.connection.db

        const clientTypes = await db.collection('ClientType').find({}).toArray()
        console.log(`Found ${clientTypes.length} Client Types to check/migrate.`)

        for (const ct of clientTypes) {
            let updated = false
            const update: any = {}

            // Check if it has old 'discount' field and no 'privileges'
            if (ct.discount !== undefined && !ct.privileges) {
                console.log(`Migrating ${ct.name} (${ct._id})...`)
                update.$set = {
                    privileges: {
                        rentDiscount: ct.discount
                    }
                }
                update.$unset = {
                    discount: ""
                }
                updated = true
            } else if (ct.privileges && ct.discount !== undefined) {
                // Cleanup if both exist (rare)
                console.log(`Cleaning up ${ct.name} (${ct._id})...`)
                update.$unset = {
                    discount: ""
                }
                updated = true
            }

            if (updated) {
                await db.collection('ClientType').updateOne({ _id: ct._id }, update)
                console.log(`Updated ${ct.name}.`)
            } else {
                console.log(`Skipping ${ct.name} (already migrated).`)
            }
        }

        console.log('Migration complete.')

    } catch (err) {
        console.error(err)
    } finally {
        await mongoose.connection.close()
    }
}

run()
