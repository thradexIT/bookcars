import * as env from '../config/env.config'
import ClientType from '../models/ClientType'
import * as logger from '../utils/logger'

export const createClientTypes = async () => {
    try {
        const clientTypes = [
            {
                name: 'External',
                displayName: 'External',
                description: 'External clients with no discount',
                discount: 0,
                active: true
            },
            {
                name: 'Insurance',
                displayName: 'Insurance',
                description: 'Insurance clients with 10% discount',
                discount: 10,
                active: true
            },
            {
                name: 'Internal',
                displayName: 'Internal',
                description: 'Internal clients with 30% discount',
                discount: 30,
                active: true
            }
        ]

        for (const ct of clientTypes) {
            const existing = await ClientType.findOne({ name: ct.name })
            if (!existing) {
                const newClientType = new ClientType(ct)
                await newClientType.save()
                logger.info(`ClientType ${ct.name} created successfully`)
            } else {
                logger.info(`ClientType ${ct.name} already exists`)
            }
        }
    } catch (err) {
        logger.error('Error creating client types', err)
    }
}
