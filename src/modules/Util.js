const logger = require('log4js').getLogger('Util')

class Util {

  get Discord() {
    return require('../utils/DiscordUtil')
  }

  get Twitter() {
    return require('../utils/TwitterUtil')
  }

  async sendEmail({ email, subject, content }) {
    // Origin
    const userOrig = {
      email: AppConst.APP_SYSTEM_EMAIL_ADDRESS,
      pass: AppConst.APP_SYSTEM_EMAIL_PASSWORD
    }
    if (!userOrig.email || !userOrig.pass) {
      logger.warn('APP_SYSTEM_EMAIL_ADDRESS or APP_SYSTEM_EMAIL_PASSWORD not found')
      return
    }
    // Destination
    if (!email) {
      logger.warn('Destination user\'s email not found')
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
      logger.info('Email >> Sent')
    } catch (err) {
      logger.error(err)
    }
  }

}

module.exports = new Util()
