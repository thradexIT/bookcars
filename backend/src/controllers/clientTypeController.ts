import { Request, Response } from 'express'
import ClientType from '../models/ClientType'
import i18n from '../lang/i18n'
import * as logger from '../utils/logger'
import * as bookcarsTypes from ':bookcars-types'

/**
 * Get all ClientTypes.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getClientTypes = async (req: Request, res: Response) => {
    try {
        const clientTypes = await ClientType.find().sort({ createdAt: -1 })
        res.json(clientTypes)
    } catch (err) {
        logger.error(`[clientType.getClientTypes] ${i18n.t('DB_ERROR')}`, err)
        res.status(400).send(i18n.t('DB_ERROR') + err)
    }
}

/**
 * Get a ClientType by ID.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getClientType = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const clientType = await ClientType.findById(id)
        if (clientType) {
            res.json(clientType)
            return
        }
        logger.error('[clientType.getClientType] ClientType not found:', id)
        res.sendStatus(204)
    } catch (err) {
        logger.error(`[clientType.getClientType] ${i18n.t('DB_ERROR')} ${id}`, err)
        res.status(400).send(i18n.t('DB_ERROR') + err)
    }
}

/**
 * Create a ClientType.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const create = async (req: Request, res: Response) => {
    try {
        const { body }: { body: bookcarsTypes.ClientType } = req
        const clientType = new ClientType(body)
        await clientType.save()
        res.json(clientType)
    } catch (err) {
        logger.error(`[clientType.create] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.body)}`, err)
        res.status(400).send(i18n.t('DB_ERROR') + err)
    }
}

/**
 * Update a ClientType.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const update = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const { body }: { body: bookcarsTypes.ClientType } = req
        const clientType = await ClientType.findById(id)

        if (clientType) {
            const { name, displayName, description, privileges, active } = body
            clientType.name = name
            clientType.displayName = displayName
            clientType.description = description
            clientType.privileges = privileges
            clientType.active = active

            await clientType.save()
            res.sendStatus(200)
        } else {
            logger.error('[clientType.update] ClientType not found:', id)
            res.sendStatus(204)
        }
    } catch (err) {
        logger.error(`[clientType.update] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.body)}`, err)
        res.status(400).send(i18n.t('DB_ERROR') + err)
    }
}

/**
 * Delete ClientTypes.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteClientTypes = async (req: Request, res: Response) => {
    const ids: string[] = req.body

    try {
        const clientTypes = await ClientType.find({ _id: { $in: ids } })
        if (clientTypes.length > 0) {
            await ClientType.deleteMany({ _id: { $in: ids } })
            res.sendStatus(200)
        } else {
            res.sendStatus(204)
        }
    } catch (err) {
        logger.error(`[clientType.delete] ${i18n.t('DB_ERROR')} ${JSON.stringify(ids)}`, err)
        res.status(400).send(i18n.t('DB_ERROR') + err)
    }
}
