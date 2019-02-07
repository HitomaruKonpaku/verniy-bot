require('dotenv').config()
const Logger = require('./module/Logger')

module.exports = {
  start: async function () {
    try {
      Logger.log('STARTING.....')
      require('./module/Prototype').load()
      if (process.env.KCSERVERWATCHER_ENABLE === '1') {
        require('./serverWatcher').start()
      }
      const DiscordClient = require('./module/DiscordClient')
      new DiscordClient().start()
    } catch (err) {
      await sendUrgentNotification(err)
    }
  }
}

async function sendUrgentNotification(error) {
  const orig = {
    email: process.env.APP_SYSTEM_EMAIL_ADDRESS,
    pass: process.env.APP_SYSTEM_EMAIL_PASSWORD
  }
  const dest = { to: process.env.APP_OWNER_EMAIL_ADDRESS }
  const mailSubject = 'Heroku App "hito-verniy" Urgent Notification'
  const mailContent = error.stack

  const nodemailer = require('nodemailer')
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: orig.email,
      pass: orig.pass
    }
  })
  const mailOptions = {
    to: dest.to,
    subject: mailSubject,
    text: mailContent

  }

  try {
    const res = await transporter.sendMail(mailOptions)
    Logger.warn('EMAIL RES ' + JSON.stringify(res))
  } catch (err) {
    Logger.error(err)
  }
}
