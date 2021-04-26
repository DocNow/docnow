import nodemailer from 'nodemailer'
import log from './logger'
import { Database } from './db'

const db = new Database()

/**
 * Send an email if the app is configured to talk to a SMTP server. 
 * @param {*} to 
 * @param {*} subject 
 * @param {*} body 
 * @returns 
 */

async function sendEmail(to, subject, body) {
  const settings = await db.getSettings()

  if (! (settings.emailHost && settings.emailPort && settings.emailPort && 
    settings.emailUser && settings.emailPassword)) {
    log.warn('Email SMTP server not configured.')
    return
  }

  const transporter = nodemailer.createTransport({
    host: settings.emailHost,
    port: settings.emailPort,
    secure: settings.emailPort == 465 ? true : false,
    auth: {
      user: settings.emailUser,
      pass: settings.emailPassword
    }
  })

  const info = await transporter.sendMail({
    from: settings.emailFromAddress,
    to: to, 
    subject: subject,
    text: body
  })

  log.info(`Email sent to=${to} subject=${subject} messageId=${info.messageId}`)
}

/**
 * Send all the admins an email.
 * @param {*} subject 
 * @param {*} body 
 */

async function sendAdminsEmail(subject, body) {
  const admins = await db.getAdminUsers()
  const emails = admins.map(u => u.email).filter(u => u !== null)
  if (emails.length > 0) {
    const to = emails.join(',')
    await sendEmail(to, subject, body)
  } else {
    log.info(`no admin email configured for new user email`)
  }
}

/**
 * Send an email to admins about a new user login. 
 * @param {models.User} user 
 */

export async function sendNewUserEmail(user) {
  const body = `
A new user signed into your DocNow instance.

Name: ${user.name}
Twitter: https://twitter.com/${user.twitterScreenName}

For them to to start using the application you will need to activate their account.
`
  await sendAdminsEmail(`New DocNow user: ${user.twitterScreenName}`, body)
}

