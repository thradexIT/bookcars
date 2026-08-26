import process from 'node:process'
import * as nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import * as env from '../config/env.config'

const emailEnabled = () => String(process.env.BC_EMAIL_ENABLED ?? 'true').toLowerCase() !== 'false'

const createTransporter = async (): Promise<nodemailer.Transporter> => {
  if (env.CI) {
    const testAccount = await nodemailer.createTestAccount()
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
  }

  const transporterOptions: SMTPTransport.Options = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  }

  return nodemailer.createTransport(transporterOptions)
}

/**
 * Sends an email using either real SMTP credentials or a test account.
 *
 * DEV/runtime certification may explicitly set BC_EMAIL_ENABLED=false so
 * email delivery remains a non-authoritative side effect and cannot turn an
 * otherwise valid local booking into a false transaction failure.
 * Production keeps email enabled by default.
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

  const transporter = await createTransporter()
  return transporter.sendMail(mailOptions)
}
