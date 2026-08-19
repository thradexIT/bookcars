import * as bookcarsTypes from ':bookcars-types'
import axiosInstance from './axiosInstance'

/**
 * Get Client Types.
 *
 * @param {string} keyword
 * @returns {Promise<bookcarsTypes.ClientType[]>}
 */
export const getClientTypes = (keyword: string): Promise<bookcarsTypes.ClientType[]> =>
    axiosInstance
        .get(
            `/api/client-types?s=${encodeURIComponent(keyword)}`,
            { withCredentials: true }
        )
        .then((res) => res.data)

/**
 * Get Client Type by ID.
 *
 * @param {string} id
 * @returns {Promise<bookcarsTypes.ClientType>}
 */
export const getClientType = (id: string): Promise<bookcarsTypes.ClientType> =>
    axiosInstance
        .get(
            `/api/client-type/${encodeURIComponent(id)}`,
            { withCredentials: true }
        )
        .then((res) => res.data)

/**
 * Create Client Type.
 *
 * @param {bookcarsTypes.ClientType} data
 * @returns {Promise<number>}
 */
export const create = (data: bookcarsTypes.ClientType): Promise<number> =>
    axiosInstance
        .post(
            '/api/create-client-type',
            data,
            { withCredentials: true }
        )
        .then((res) => res.status)

/**
 * Update Client Type.
 *
 * @param {bookcarsTypes.ClientType} data
 * @returns {Promise<number>}
 */
export const update = (data: bookcarsTypes.ClientType): Promise<number> =>
    axiosInstance
        .put(
            `/api/update-client-type/${data._id}`,
            data,
            { withCredentials: true }
        )
        .then((res) => res.status)

/**
 * Delete Client Types.
 *
 * @param {string[]} ids
 * @returns {Promise<number>}
 */
export const deleteClientTypes = (ids: string[]): Promise<number> =>
    axiosInstance
        .post(
            '/api/delete-client-types',
            ids,
            { withCredentials: true }
        )
        .then((res) => res.status)
