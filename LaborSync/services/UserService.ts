import axiosInstance, { DEFAULT_LANGUAGE } from './axiosInstance'
import AsyncStorage from '@react-native-async-storage/async-storage'

const AUTH_KEY = 'laborsync_token'
const USER_KEY = 'laborsync_user'

export interface SignInPayload {
  email: string
  password: string
}

export const signIn = async (payload: SignInPayload): Promise<any> => {
  const res = await axiosInstance.post('/api/sign-in/admin', {
    ...payload,
    mobile: true,   // tells backend to return token in body, not cookie
    stayConnected: true,
  })
  if (res.data?.accessToken) {
    await AsyncStorage.setItem(AUTH_KEY, res.data.accessToken)
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(res.data))
  }
  return res.data
}

export const signOut = async () => {
  await AsyncStorage.removeItem(AUTH_KEY)
  await AsyncStorage.removeItem(USER_KEY)
}

export const getUser = async (): Promise<any | null> => {
  const raw = await AsyncStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(AUTH_KEY)
}

export const getLanguage = () => DEFAULT_LANGUAGE

export const authHeader = async () => {
  const token = await getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
