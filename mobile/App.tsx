import 'react-native-gesture-handler'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { NavigationContainerRef } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-native-paper'
import * as SplashScreen from 'expo-splash-screen'
import * as Notifications from 'expo-notifications'
import { StripeProvider } from '@stripe/stripe-react-native'
import * as helper from './utils/helper'
import * as NotificationService from './services/NotificationService'
import * as UserService from './services/UserService'
import { GlobalProvider } from './context/GlobalContext'
import * as env from './config/env.config'
import { AutocompleteDropdownContextProvider } from '@/components/AutocompleteDropdown-v4.3.1'
import NavigationWrapper from '@/components/NavigationWrapper'
import { SettingProvider } from './context/SettingContext'
import { AuthProvider } from './context/AuthContext'

console.log('DEBUG: API_HOST loaded as:', env.API_HOST)

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowList: true,
    }),
  })
} catch (err) {
  console.log('Notifications.setNotificationHandler failed (Expo Go?):', err)
}

//
// Keep the splash screen visible while we fetch resources
//
SplashScreen.preventAutoHideAsync()

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false)
  const [isNavReady, setIsNavReady] = useState(false)

  const responseListener = useRef<Notifications.EventSubscription | null>(null)
  const navigationRef = useRef<NavigationContainerRef<StackParams> | null>(null)

  useEffect(() => {
    const register = async () => {
      const loggedIn = await UserService.loggedIn()
      if (loggedIn) {
        const currentUser = await UserService.getCurrentUser()
        if (currentUser?._id) {
          await helper.registerPushToken(currentUser._id)
        } else {
          helper.error()
        }
      }
    }

    //
    // Register push notifiations token
    //
    // try {
    //   register()
    // } catch (err) {
    //   console.log('Register push token failed:', err)
    // }

    //
    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    //
    //
    try {
      responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response) => {
        try {
          if (navigationRef.current) {
            const { data } = response.notification.request.content

            if (data.booking) {
              if (data.user && data.notification) {
                await NotificationService.markAsRead(data.user as string, [data.notification as string])
              }
              navigationRef.current.navigate('Booking', { id: data.booking as string })
            } else {
              navigationRef.current.navigate('Notifications', {})
            }
          }
        } catch (err) {
          helper.error(err, false)
        }
      })
    } catch (err) {
      console.log('Notifications listener failed:', err)
    }

    return () => {
      if (responseListener.current) {
        try {
          responseListener.current.remove()
        } catch (err) {
          console.log('Failed to remove notification subscription:', err)
        }
      }
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('DEBUG: setTimeout fired, setting appIsReady to true')
      setAppIsReady(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const onReady = useCallback(() => {
    console.log('DEBUG: onReady called')
    setIsNavReady(true)
  }, [])

  useEffect(() => {
    if (appIsReady && isNavReady) {
      console.log('DEBUG: Hiding Splash Screen now')
      SplashScreen.hideAsync().catch((err) => {
        console.log('DEBUG: Error hiding splash screen:', err)
      })
    }
  }, [appIsReady, isNavReady])

  return (
    <SettingProvider>
      <GlobalProvider>
        <AuthProvider>
          <SafeAreaProvider>
            <Provider>
              <StripeProvider publishableKey={env.STRIPE_PUBLISHABLE_KEY} merchantIdentifier={env.STRIPE_MERCHANT_IDENTIFIER}>
                <AutocompleteDropdownContextProvider>
                  <NavigationWrapper
                    ref={navigationRef}
                    onReady={onReady}
                  />
                </AutocompleteDropdownContextProvider>
              </StripeProvider>
            </Provider>
          </SafeAreaProvider>
        </AuthProvider>
      </GlobalProvider>
    </SettingProvider>
  )
}

export default App
