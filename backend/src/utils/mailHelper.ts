import process from 'node:process'
import * as nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import * as env from '../config/env.config'

const DEFAULT_EMAIL_TIMEOUT_MS = 10_000
const DEFAULT_RESEND_API_URL = 'https://api.resend.com/emails'

type EmailProvider = 'smtp' | 'resend'

const emailEnabled = () => String(process.env.BC_EMAIL_ENABLED ?? 'true').toLowerCase() !== 'false'

const getEmailProvider = (): EmailProvider => {
  const provider = String(process.env.BC_EMAIL_PROVIDER ?? 'smtp').trim().toLowerCase()

  if (provider !== 'smtp' && provider !== 'resend') {
    throw new Error(`Unsupported email provider: ${provider}`)
  }

  return provider
}

const getEmailTimeoutMs = () => {
  const timeout = Number.parseInt(String(process.env.BC_EMAIL_TIMEOUT_MS ?? DEFAULT_EMAIL_TIMEOUT_MS), 10)
  return Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_EMAIL_TIMEOUT_MS
}

const normalizeAddresses = (value: unknown): string[] => {
  if (!value) {
    return []
  }

  const values = Array.isArray(value) ? value : [value]
  const addresses: string[] = []

  for (const item of values) {
    if (typeof item === 'string') {
      addresses.push(...item.split(',').map((entry) => entry.trim()).filter(Boolean))
      continue
    }

    if (item && typeof item === 'object' && 'address' in item) {
      const address = String((item as { address?: unknown }).address ?? '').trim()
      const name = String((item as { name?: unknown }).name ?? '').trim()
      if (address) {
        addresses.push(name ? `${name} <${address}>` : address)
      }
    }
  }

  return addresses
}

const createTransporter = async (): Promise<nodemailer.Transporter> => {
  const timeout = getEmailTimeoutMs()

  if (env.CI) {
    const testAccount = await nodemailer.createTestAccount()
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      connectionTimeout: timeout,
      greetingTimeout: timeout,
      socketTimeout: timeout,
    })
  }

  const transporterOptions: SMTPTransport.Options = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: String(process.env.BC_SMTP_SECURE ?? (env.SMTP_PORT === 465)).toLowerCase() === 'true',
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    connectionTimeout: timeout,
    greetingTimeout: timeout,
    socketTimeout: timeout,
  }

  return nodemailer.createTransport(transporterOptions)
}

const sendWithResend = async (mailOptions: nodemailer.SendMailOptions): Promise<nodemailer.SentMessageInfo> => {
  const apiKey = String(process.env.BC_RESEND_API_KEY ?? '').trim()
  if (!apiKey) {
    throw new Error('BC_RESEND_API_KEY not found')
  }

  const to = normalizeAddresses(mailOptions.to)
  if (to.length === 0) {
    throw new Error('Email recipient not found')
  }

  const configuredFrom = String(process.env.BC_EMAIL_FROM ?? '').trim()
  const from = configuredFrom || normalizeAddresses(mailOptions.from)[0] || env.SMTP_FROM
  if (!from) {
    throw new Error('Email sender not found. Set BC_EMAIL_FROM for Resend.')
  }

  const payload: Record<string, unknown> = {
    from,
    to,
    subject: String(mailOptions.subject ?? ''),
  }

  if (typeof mailOptions.html === 'string') {
    payload.html = mailOptions.html
  }
  if (typeof mailOptions.text === 'string') {
    payload.text = mailOptions.text
  }

  const cc = normalizeAddresses(mailOptions.cc)
  if (cc.length > 0) {
    payload.cc = cc
  }

  const bcc = normalizeAddresses(mailOptions.bcc)
  if (bcc.length > 0) {
    payload.bcc = bcc
  }

  const replyTo = normalizeAddresses(mailOptions.replyTo)
  if (replyTo.length > 0) {
    payload.reply_to = replyTo
  }

  if (!payload.html && !payload.text) {
    throw new Error('Resend email requires html or text content')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), getEmailTimeoutMs())

  try {
    const response = await fetch(
      String(process.env.BC_RESEND_API_URL ?? DEFAULT_RESEND_API_URL),
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      },
    )

    const responseText = await response.text()
    if (!response.ok) {
      throw new Error(`Resend API error ${response.status}: ${responseText}`)
    }

    let responseData: { id?: string } = {}
    if (responseText) {
      try {
        responseData = JSON.parse(responseText) as { id?: string }
      } catch {
        responseData = {}
      }
    }

    return {
      messageId: responseData.id || 'resend-email-sent',
      accepted: to,
      rejected: [],
      response: `Resend HTTP ${response.status}`,
    } as nodemailer.SentMessageInfo
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Email provider timeout after ${getEmailTimeoutMs()}ms`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Send an email through the configured transport.
 *
 * SMTP/Nodemailer remains the default and canonical transport. Set
 * BC_EMAIL_PROVIDER=resend only on infrastructure where outbound SMTP is not
 * available (for example Railway Hobby). Both transports preserve the same
 * mailHelper.sendMail() contract so the rest of the application stays
 * transport-agnostic.
 *
 * @param mailOptions - Email content and metadata
 * @returns A promise resolving to the sending result
 */
export const sendMail = async (mailOptions: nodemailer.SendMailOptions): Promise<nodemailer.SentMessageInfo> => {
  if (!emailEnabled()) {
    return {
      messageId: 'mitos-dev-email-disabled',
      accepted: [],
      rejected: [],
      response: 'BC_EMAIL_ENABLED=false',
    } as nodemailer.SentMessageInfo
  }

  if (!env.CI && getEmailProvider() === 'resend') {
    return sendWithResend(mailOptions)
  }

  const transporter = await createTransporter()
  return transporter.sendMail(mailOptions)
}
