import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import * as bookcarsTypes from ':bookcars-types'

import * as UserService from '@/services/UserService'
import * as helper from '@/utils/helper'

interface BookingStatusProps {
  style: object
  status: bookcarsTypes.BookingStatus
}

const BookingStatus = ({
  style,
  status
}: BookingStatusProps) => {
  const [isInternal, setIsInternal] = React.useState(false)

  React.useEffect(() => {
    const init = async () => {
      const user = await UserService.getCurrentUser()
      if (user) {
        const _isInternal = (user.type === bookcarsTypes.UserType.Admin || user.type === bookcarsTypes.UserType.Supplier) || (user.clientType && typeof user.clientType !== 'string' && user.clientType.name === 'Internal')
        setIsInternal(!!_isInternal)
      }
    }
    init()
  }, [])

  const styles = StyleSheet.create({
    container: {
      height: 28,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 18,
    },
    text: {
      color: status === bookcarsTypes.BookingStatus.Void
        ? '#6E7C86'
        : status === bookcarsTypes.BookingStatus.Pending
          ? '#EF6C00'
          : status === bookcarsTypes.BookingStatus.Deposit
            ? '#3CB371'
            : status === bookcarsTypes.BookingStatus.Paid
              ? '#77BC23'
              : status === bookcarsTypes.BookingStatus.PaidInFull
                ? '#FFF'
                : status === bookcarsTypes.BookingStatus.Reserved
                  ? '#1E88E5'
                  : status === bookcarsTypes.BookingStatus.Cancelled
                    ? '#E53935'
                    : 'transparent',
      fontSize: 13,
      fontWeight: '400',
    },
  })

  const statusLabel = (status === bookcarsTypes.BookingStatus.Deposit && isInternal) ? '' : helper.getBookingStatus(status)

  return (
    <View
      style={{
        ...styles.container,
        ...style,
        backgroundColor:
          (status === bookcarsTypes.BookingStatus.Deposit && isInternal)
            ? 'transparent'
            : status === bookcarsTypes.BookingStatus.Void
              ? '#D9D9D9'
              : status === bookcarsTypes.BookingStatus.Pending
                ? '#FBDCC2'
                : status === bookcarsTypes.BookingStatus.Deposit
                  ? '#CDECDA'
                  : status === bookcarsTypes.BookingStatus.Paid
                    ? '#D1F9D1'
                    : status === bookcarsTypes.BookingStatus.PaidInFull
                      ? '#77BC23'
                      : status === bookcarsTypes.BookingStatus.Reserved
                        ? '#D9E7F4'
                        : status === bookcarsTypes.BookingStatus.Cancelled
                          ? '#FBDFDE'
                          : 'transparent',
      }}
    >
      <Text style={styles.text}>{statusLabel}</Text>
    </View>
  )
}

export default BookingStatus
