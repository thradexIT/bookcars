import { Request } from 'express'
import { jwtVerify, SignJWT } from 'jose'
import bcrypt from 'bcrypt'
import * as bookcarsTypes from ':bookcars-types'
import * as helper from './helper'
import { OAuth2Client } from 'google-auth-library'
import axios from 'axios'
import * as env from '../config/env.config'

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID)

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET)
const jwtAlg = 'HS256'

export type SessionData = {
  id: string
}

/**
 * Sign and return the JWT.
 *
 * @async
 * @param {SessionData} payload
 * @param {?boolean} [stayConnected]
 * @returns {Promise<string>}
 */
export const encryptJWT = async (payload: SessionData, stayConnected?: boolean) => {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: jwtAlg })
    .setIssuedAt()

  if (!stayConnected) {
    jwt.setExpirationTime(`${env.JWT_EXPIRE_AT} seconds`)
  }

  return jwt.sign(jwtSecret)
}

/**
 * Verify the JWT format, verify the JWS signature, validate the JWT Claims Set.
 *
 * @async
 * @param {string} input
 * @returns {Promise<SessionData>}
 */
export const decryptJWT = async (input: string) => {
  const { payload } = await jwtVerify(input, jwtSecret, {
    algorithms: [jwtAlg],
  })
  return payload as SessionData
}

const safeURL = (value?: string) => {
  if (!value) {
    return null
  }

  try {
    return new URL(value)
  } catch {
    return null
  }
}

const isAdminPath = (pathname: string) => pathname === '/admin' || pathname.startsWith('/admin/')

/**
 * Determine whether the request belongs to the admin surface.
 *
 * Mitos serves customer `/` and admin `/admin/` from the same Railway origin.
 * Browser Origin headers never include a path, so an origin match alone cannot
 * distinguish the two surfaces when ADMIN_HOST and FRONTEND_HOST share an
 * origin. In that topology, the Referer path is authoritative.
 */
export const isAdmin = (req: Request): boolean => {
  const origin = safeURL(req.headers.origin)
  const referer = safeURL(req.headers.referer)
  const adminHost = safeURL(env.ADMIN_HOST)
  const frontendHost = safeURL(env.FRONTEND_HOST)

  if (referer && isAdminPath(referer.pathname)) {
    return true
  }

  const sharedBrowserOrigin = Boolean(
    adminHost
    && frontendHost
    && adminHost.origin === frontendHost.origin,
  )

  if (sharedBrowserOrigin) {
    // On the shared Mitos host, a non-admin referer is definitively customer.
    if (referer && adminHost && referer.origin === adminHost.origin) {
      return false
    }

    // Origin by itself cannot prove admin because both SPAs share it.
    if (origin && adminHost && origin.origin === adminHost.origin) {
      return false
    }
  }

  if (origin && adminHost && origin.origin === adminHost.origin) {
    return true
  }

  const rawOrigin = req.headers.origin
  if (rawOrigin) {
    const trimmedOrigin = helper.trimEnd(rawOrigin, '/')
    if (
      trimmedOrigin === 'http://localhost:3001'
      || trimmedOrigin.includes('admin.thradex.com')
    ) {
      return true
    }
  }

  return false
}

/**
 * Check whether the request is from the frontend or not.
 *
 * @export
 * @param {Request} req
 * @returns {boolean}
 */
export const isFrontend = (req: Request): boolean => {
  const origin = safeURL(req.headers.origin)
  const referer = safeURL(req.headers.referer)
  const adminHost = safeURL(env.ADMIN_HOST)
  const frontendHost = safeURL(env.FRONTEND_HOST)

  if (referer) {
    if (isAdminPath(referer.pathname)) {
      return false
    }

    if (frontendHost && referer.origin === frontendHost.origin) {
      return true
    }
  }

  if (origin && frontendHost && origin.origin === frontendHost.origin) {
    return true
  }

  const rawOrigin = req.headers.origin
  if (rawOrigin) {
    const trimmedOrigin = helper.trimEnd(rawOrigin, '/')
    if (
      trimmedOrigin === 'http://localhost:3002'
      || trimmedOrigin.includes('rentacar.thradex.com')
      || trimmedOrigin.includes('165.1.122.9')
      || trimmedOrigin.startsWith('http://192.168.')
    ) {
      return true
    }
  }

  // Browser GETs often omit Origin. A non-admin referer is the customer surface.
  if (referer && !isAdminPath(referer.pathname)) {
    return true
  }

  // Keep legacy ngrok behavior customer-first unless the referer explicitly says /admin.
  if (req.headers.origin?.includes('ngrok-free.dev')) {
    return true
  }

  // If both configured hosts share an origin and this request has no useful
  // browser context, default to the customer surface rather than granting admin.
  if (adminHost && frontendHost && adminHost.origin === frontendHost.origin) {
    return true
  }

  return false
}

/**
 * Get authentification cookie name.
 *
 * @param {Request} req
 * @returns {string}
 */
export const getAuthCookieName = (req: Request): string => {
  if (isAdmin(req)) {
    // Admin auth cookie name
    return env.ADMIN_AUTH_COOKIE_NAME
  }

  if (isFrontend(req)) {
    // Frontend auth cookie name
    return env.FRONTEND_AUTH_COOKIE_NAME
  }

  // Mobile app and unit tests auth header name
  return env.X_ACCESS_TOKEN
}

/**
 * Hash password using bcrypt.
 *
 * @async
 * @param {string} password 
 * @returns {Promise<string>} 
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Parse JWT token.
 *
 * @param {string} token
 * @returns {any}
 */
export const parseJwt = (token: string) => JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())

/**
 * Validate JWT token structure.
 *
 * @param {bookcarsTypes.SocialSignInType} socialSignInType
 * @param {string} token
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export const validateAccessToken = async (socialSignInType: bookcarsTypes.SocialSignInType, token: string, email: string): Promise<boolean> => {
  if (socialSignInType === bookcarsTypes.SocialSignInType.Facebook) {
    try {
      parseJwt(token)
      return true
    } catch {
      return false
    }
  }

  if (socialSignInType === bookcarsTypes.SocialSignInType.Apple) {
    try {
      const res = parseJwt(token)
      return res.email === email
    } catch {
      return false
    }
  }

  if (socialSignInType === bookcarsTypes.SocialSignInType.Google) {
    const isJWT = token.split('.').length === 3
    if (isJWT) {
      try {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: env.GOOGLE_CLIENT_ID,
        })
        const payload = ticket.getPayload()
        return payload?.email === email
      } catch (err) {
        console.error(err)
        return false
      }
    } else {
      try {
        const res = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`)
        if (res.status === 200) {
          return res.data.email === email
        }
        return false
      } catch (err) {
        console.error(err)
        return false
      }
    }
  }

  return false
}
