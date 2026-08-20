import ClientType from '../models/ClientType'
import * as logger from '../utils/logger'

export const createClientTypes = async () => {
  try {
    const clientTypes = [
      {
        name: 'External',
        displayName: 'External',
        description: 'External clients with no discount',
        privileges: { rentDiscount: 0 },
        active: true,
      },
      {
        name: 'Insurance',
        displayName: 'Insurance',
        description: 'Insurance clients with 10% discount',
        privileges: { rentDiscount: 10 },
        active: true,
      },
      {
        name: 'Internal',
        displayName: 'Internal',
        description: 'Internal clients with 30% discount',
        privileges: { rentDiscount: 30 },
        active: true,
      },
    ]

    for (const clientType of clientTypes) {
      const existing = await ClientType.findOne({ name: clientType.name })
      if (!existing) {
        const newClientType = new ClientType(clientType)
        await newClientType.save()
        logger.info(`ClientType ${clientType.name} created successfully`)
      } else {
        logger.info(`ClientType ${clientType.name} already exists`)
      }
    }
  } catch (err) {
    logger.error('Error creating client types', err)
  }
}
