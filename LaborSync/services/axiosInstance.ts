import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Backend URL ─────────────────────────────────────────────────────────────────
// ngrok tunnel → valid HTTPS cert, no device config needed, already CORS-whitelisted.
// Switch to local IP only if ngrok is not running.
export const API_HOST = 'https://seisable-segmentally-jolyn.ngrok-free.dev'
// export const API_HOST = 'https://192.168.18.13:4002'  // requires trusting self-signed cert
export const DEFAULT_LANGUAGE = 'es'
// ──────────────────────────────────────────────────────────────────────────────

const axiosInstance = axios.create({
  baseURL: API_HOST,
  timeout: 15000,
  headers: {
    // Required when using ngrok tunnel — skips the browser warning interstitial page
    'ngrok-skip-browser-warning': '1',
  },
})

// Attach the mobile token on every request using the header the backend expects
axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('laborsync_token')
  if (token) {
    config.headers['x-access-token'] = token
  }
  return config
})

// Log errors for easier debugging
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      console.error('[API Error]', error.message, error.config?.url, error.response?.status)
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
