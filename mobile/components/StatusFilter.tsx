import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'

import * as UserService from '@/services/UserService'
import * as helper from '@/utils/helper'
import i18n from '@/lang/i18n'
import Accordion from './Accordion'
import BookingStatus from './BookingStatus'
import Link from './Link'
import Switch from './Switch'

interface StatusFilterProps {
  visible?: boolean
  style?: object
  onLoad?: (checkedStatuses: bookcarsTypes.BookingStatus[]) => void
  onChange?: (checkedStatuses: bookcarsTypes.BookingStatus[]) => void
}

const allStatuses = helper.getBookingStatuses().map((status) => status.value)

const StatusFilter = ({
  visible,
  style,
  onLoad,
  onChange
}: StatusFilterProps) => {
  const [statuses, setStatuses] = useState<bookcarsTypes.StatusFilterItem[]>(
    helper.getBookingStatuses().map((status) => ({ ...status, checked: false }))
  )
  const [checkedStatuses, setCheckedStatuses] = useState<bookcarsTypes.BookingStatus[]>([])
  const [allChecked, setAllChecked] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const init = async () => {
      const user = await UserService.getCurrentUser()
      const isInternalUserType = user && (user.type === bookcarsTypes.UserType.Admin || user.type === bookcarsTypes.UserType.Supplier)

      let isInternalClientType = false
      if (user && user.clientType) {
        if (typeof user.clientType === 'string') {
          // Should be populated if needed, but assuming mobile stores basic info. 
          // If clientType is just an ID string, we can't check the name easily without fetching.
          // However, let's check if the user object has the populated clientType or if we need to fetch it.
        } else {
          if (user.clientType.name === 'Internal') {
            isInternalClientType = true
          }
        }
      }

      // If we can't reliably get clientType name from local user, we might need to fetch it or rely on valid token check.
      // But let's look at CheckoutScreen logic: it gets user from UserService.getUser(currentUser._id) which fetches fresh data.
      // We should probably do the same here to be safe, or just check the type if that's sufficient for "Internal" in the user's mind.
      // The user said "ClientType: Internal", identifying themselves as such.

      // Let's try to fetch the full user to be sure about clientType
      let fullUser = user
      if (user && user._id) {
        fullUser = await UserService.getUser(user._id)
      }

      let isInternal = false
      if (fullUser) {
        const typeInternal = fullUser.type === bookcarsTypes.UserType.Admin || fullUser.type === bookcarsTypes.UserType.Supplier
        let clientTypeInternal = false
        if (fullUser.clientType && typeof fullUser.clientType !== 'string' && fullUser.clientType.name === 'Internal') {
          clientTypeInternal = true
        }
        isInternal = typeInternal || clientTypeInternal
      }

      let _statuses = helper.getBookingStatuses()

      if (isInternal) {
        _statuses = _statuses.filter(status => status.value !== bookcarsTypes.BookingStatus.Deposit)
      }

      setStatuses(_statuses.map((status) => ({ ...status, checked: false })))

      if (onLoad) {
        onLoad(_statuses.map((status) => status.value))
      }
      setLoaded(true)
    }

    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (_checkedStatuses: bookcarsTypes.BookingStatus[]) => {
    if (onChange) {
      if (_checkedStatuses.length === 0) {
        const currentStatuses = statuses.map((status) => status.value)
        onChange(currentStatuses)
      } else {
        onChange(bookcarsHelper.clone(_checkedStatuses))
      }
    }
  }

  return (
    visible && (
      <View style={{ ...styles.container, ...style }}>
        <Accordion style={styles.accordion} title={i18n.t('BOOKING_STATUS')}>
          <View style={styles.statuses}>
            {statuses.map((status) => (
              typeof status.checked !== 'undefined'
              && (
                <View key={status.value} style={styles.status}>
                  <Switch
                    value={status.checked}
                    onValueChange={(checked) => {
                      if (checked) {
                        status.checked = true
                        setStatuses(bookcarsHelper.clone(statuses))
                        checkedStatuses.push(status.value)

                        if (checkedStatuses.length === statuses.length) {
                          setAllChecked(true)
                        }
                      } else {
                        status.checked = false
                        setStatuses(bookcarsHelper.clone(statuses))
                        const index = checkedStatuses.indexOf(status.value)
                        checkedStatuses.splice(index, 1)

                        if (checkedStatuses.length === 0) {
                          setAllChecked(false)
                        }
                      }

                      handleChange(checkedStatuses)
                    }}
                  >
                    <BookingStatus style={styles.bookingStatus} status={status.value} />
                  </Switch>
                </View>
              )
            ))}
          </View>

          <Link
            style={styles.link}
            textStyle={styles.linkText}
            label={allChecked ? i18n.t('UNCHECK_ALL') : i18n.t('CHECK_ALL')}
            onPress={() => {
              let _checkedStatuses: bookcarsTypes.BookingStatus[] = []
              if (allChecked) {
                statuses.forEach((status) => {
                  status.checked = false
                })
                setAllChecked(false)
                setStatuses(bookcarsHelper.clone(statuses))
                setCheckedStatuses(_checkedStatuses)
              } else {
                statuses.forEach((status) => {
                  status.checked = true
                })
                setAllChecked(true)
                setStatuses(bookcarsHelper.clone(statuses))
                _checkedStatuses = bookcarsHelper.clone(statuses.map((status) => status.value))
                setCheckedStatuses(_checkedStatuses)

                if (onChange) {
                  onChange(_checkedStatuses)
                }
              }
            }}
          />
        </Accordion>
      </View>
    )
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  accordion: {
    width: '100%',
    maxWidth: 480,
  },
  statuses: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    padding: 5,
  },
  status: {
    width: '50%',
    marginBottom: 4,
  },
  bookingStatus: {
    width: 128,
  },
  link: {
    marginVertical: 10,
  },
  linkText: {
    fontSize: 12,
  },
})

export default StatusFilter
