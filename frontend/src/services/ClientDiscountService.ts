import * as bookcarsTypes from ':bookcars-types'
import * as UserService from './UserService'

/**
 * Get client discount for the current user.
 *
 * @async
 * @returns {Promise<number>}
 */
export const getClientDiscount = async (): Promise<number> => {
    try {
        const currentUser = await UserService.getCurrentUser()

        if (currentUser && currentUser.clientType) {
            const clientType = currentUser.clientType as bookcarsTypes.ClientType
            if (clientType.active && clientType.privileges) {
                return clientType.privileges.rentDiscount || 0
            }
        }

        return 0
    } catch (err) {
        console.error('Error getting client discount:', err)
        return 0
    }
}
