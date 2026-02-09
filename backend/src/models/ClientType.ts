import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

const clientTypeSchema = new Schema<env.ClientType>(
    {
        name: {
            type: String,
            required: [true, "can't be blank"],
            unique: true,
            index: true,
            trim: true,
        },
        displayName: {
            type: String,
            required: [true, "can't be blank"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        privileges: {
            rentDiscount: {
                type: Number,
                required: [true, "can't be blank"],
                min: 0,
                max: 100,
            }
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        strict: true,
        collection: 'ClientType',
    },
)

const ClientType = model<env.ClientType>('ClientType', clientTypeSchema)

export default ClientType
