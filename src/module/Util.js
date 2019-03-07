const Logger = require('../module/Logger')
const ConfigVar = require('./ConfigVar')

class Util {

  async sendEmail({ email, subject, content }) {
    //
    if (!ConfigVar.APP_SYSTEM_EMAIL_ADDRESS || !ConfigVar.APP_SYSTEM_EMAIL_PASSWORD) {
      Logger.warn('APP_SYSTEM_EMAIL_ADDRESS or APP_SYSTEM_EMAIL_PASSWORD not found')
      return
    }
    //
    if (!email) {
      Logger.warn('Destination user\'s email not found')
      return
    }
    // Origin
    const userOrig = {
      email: ConfigVar.APP_SYSTEM_EMAIL_ADDRESS,
      pass: ConfigVar.APP_SYSTEM_EMAIL_PASSWORD
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
      const res = await transporter.sendMail(mailOptions)
      Logger.warn('EMAIL RES ' + JSON.stringify(res))
    } catch (err) {
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
