import process from 'node:process'
import path from 'node:path'
import asyncFs from 'node:fs/promises'
import * as nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import * as env from '../config/env.config'

const DEFAULT_EMAIL_TIMEOUT_MS = 10_000
const DEFAULT_RESEND_API_URL = 'https://api.resend.com/emails'
const DEFAULT_MAILERSEND_API_URL = 'https://api.mailersend.com/v1/email'

type EmailProvider = 'smtp' | 'resend' | 'mailersend'
type ApiAddress = { email: string; name?: string }

const emailEnabled = () => String(process.env.BC_EMAIL_ENABLED ?? 'true').toLowerCase() !== 'false'

const getEmailProvider = (): EmailProvider => {
  const provider = String(process.env.BC_EMAIL_PROVIDER ?? 'smtp').trim().toLowerCase()

  if (provider !== 'smtp' && provider !== 'resend' && provider !== 'mailersend') {
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

const parseAddress = (value: string): ApiAddress => {
  const trimmed = value.trim()
  const match = trimmed.match(/^(?:"?([^"<>]*?)"?\s*)?<([^<>]+)>$/)

  if (match) {
    const name = match[1]?.trim()
    const email = match[2].trim()
    return name ? { email, name } : { email }
  }

  return { email: trimmed }
}

const normalizeApiAddresses = (value: unknown): ApiAddress[] => normalizeAddresses(value).map(parseAddress)

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

const buildMailerSendAttachments = async (attachments: nodemailer.SendMailOptions['attachments']) => {
  if (!attachments || attachments.length === 0) {
    return []
  }

  const result: Array<{ content: string; filename: string; disposition?: string; id?: string }> = []

  for (const item of attachments) {
    const attachment = item as {
      path?: unknown
      content?: unknown
      filename?: unknown
      contentDisposition?: unknown
      cid?: unknown
    }

    let content: Buffer | null = null
    let filename = String(attachment.filename ?? '').trim()

    if (typeof attachment.path === 'string' && attachment.path) {
      content = await asyncFs.readFile(attachment.path)
      filename = filename || path.basename(attachment.path)
    } else if (Buffer.isBuffer(attachment.content)) {
      content = attachment.content
    } else if (typeof attachment.content === 'string') {
      content = Buffer.from(attachment.content)
    }

    if (!content) {
      throw new Error('MailerSend attachment requires a filesystem path, Buffer, or string content')
    }
    if (!filename) {
      throw new Error('MailerSend attachment filename not found')
    }

    const apiAttachment: { content: string; filename: string; disposition?: string; id?: string } = {
      content: content.toString('base64'),
      filename,
    }

    if (attachment.contentDisposition === 'inline' || attachment.contentDisposition === 'attachment') {
      apiAttachment.disposition = attachment.contentDisposition
    }
    if (attachment.cid) {
      apiAttachment.id = String(attachment.cid)
    }

    result.push(apiAttachment)
  }

  return result
}

const sendWithMailerSend = async (mailOptions: nodemailer.SendMailOptions): Promise<nodemailer.SentMessageInfo> => {
  const apiKey = String(process.env.BC_MAILERSEND_API_KEY ?? '').trim()
  if (!apiKey) {
    throw new Error('BC_MAILERSEND_API_KEY not found')
  }

  const to = normalizeApiAddresses(mailOptions.to)
  if (to.length === 0) {
    throw new Error('Email recipient not found')
  }

  const configuredFrom = String(process.env.BC_EMAIL_FROM ?? '').trim()
  const fallbackFrom = normalizeAddresses(mailOptions.from)[0] || env.SMTP_FROM
  const fromValue = configuredFrom || fallbackFrom
  if (!fromValue) {
    throw new Error('Email sender not found. Set BC_EMAIL_FROM for MailerSend.')
  }

  const payload: Record<string, unknown> = {
    from: parseAddress(fromValue),
    to,
    subject: String(mailOptions.subject ?? ''),
  }

  if (typeof mailOptions.html === 'string') {
    payload.html = mailOptions.html
  }
  if (typeof mailOptions.text === 'string') {
    payload.text = mailOptions.text
  }

  const cc = normalizeApiAddresses(mailOptions.cc)
  if (cc.length > 0) {
    payload.cc = cc
  }

  const bcc = normalizeApiAddresses(mailOptions.bcc)
  if (bcc.length > 0) {
    payload.bcc = bcc
  }

  const replyTo = normalizeApiAddresses(mailOptions.replyTo)
  if (replyTo.length > 0) {
    payload.reply_to = replyTo[0]
  }

  const attachments = await buildMailerSendAttachments(mailOptions.attachments)
  if (attachments.length > 0) {
    payload.attachments = attachments
  }

  if (!payload.html && !payload.text) {
    throw new Error('MailerSend email requires html or text content')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), getEmailTimeoutMs())

  try {
    const response = await fetch(
      String(process.env.BC_MAILERSEND_API_URL ?? DEFAULT_MAILERSEND_API_URL),
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      },
    )

    const responseText = await response.text()
    if (!response.ok) {
      throw new Error(`MailerSend API error ${response.status}: ${responseText}`)
    }

    const messageId = response.headers.get('x-message-id') || 'mailersend-email-accepted'

    return {
      messageId,
      accepted: to.map(({ email }) => email),
      rejected: [],
      response: `MailerSend HTTP ${response.status}`,
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
 * SMTP/Nodemailer remains the default and canonical transport. API transports
 * are opt-in for infrastructure where outbound SMTP is unavailable. This keeps
 * VPS deployments on the standard SMTP path while Railway Hobby can use an
 * HTTPS provider without changing any mail call sites.
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

  if (!env.CI) {
    const provider = getEmailProvider()
    if (provider === 'resend') {
      return sendWithResend(mailOptions)
    }
    if (provider === 'mailersend') {
      return sendWithMailerSend(mailOptions)
    }
  }

  const transporter = await createTransporter()
  return transporter.sendMail(mailOptions)
}
