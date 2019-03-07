const Logger = require('../module/Logger')
const ConfigVar = require('./ConfigVar')

class Util {

  async sendEmail({ email, subject, content }) {
    // Origin
    const userOrig = {
      email: ConfigVar.APP_SYSTEM_EMAIL_ADDRESS,
      pass: ConfigVar.APP_SYSTEM_EMAIL_PASSWORD
    }
    if (!userOrig.email || !userOrig.pass) {
      Logger.warn('APP_SYSTEM_EMAIL_ADDRESS or APP_SYSTEM_EMAIL_PASSWORD not found')
      return
    }
    // Destination
    if (!email) {
      Logger.warn('Destination user\'s email not found')
      return
    }
    // Transporter
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: userOrig.email,
        pass: userOrig.pass
      }
    })
    // Mail data
    const mailOptions = {
      to: email,
      subject: subject,
      text: content
    }
    // Send
    try {
      await transporter.sendMail(mailOptions)
      Logger.warn('EMAIL SENT')
    } catch (err) {
      Logger.error(err)
    }
  }

  async sendDiscordWebhook({ url, id, token, message, embed }) {
    // Check id & token
    if (url) {
      const arr = url.split('/')
      if (arr.length != 7) return
      id = arr[5]
      token = arr[6]
    }
    if (!id || !token) {
      return
    }
    // Send
    const { WebhookClient } = require('discord.js')
    const wh = new WebhookClient(id, token)
    try {
      await wh.send(message, embed)
      Logger.warn('WEBHOOK SENT')
    }
    catch (err) {
      Logger.error(err)
    }
  }

  getRandomNumber(min, max) {
    min = Number(min)
    max = Number(max)
    const random = Math.floor(Math.random() * (max - min + 1)) + min
    Logger.log(`RNG > Min ${min} > Max ${max} > Random ${random}`)
    return random
  }

}

module.exports = new Util()
