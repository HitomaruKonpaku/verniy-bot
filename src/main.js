const Logger = require('./module/Logger')
const ConfigVar = require('./module/ConfigVar')

class MainProcess {

  constructor() { }

  async start() {
    try {
      //
      Logger.log('MAIN PROCESS STARTING...')
      //
      if (ConfigVar.KCSERVERWATCHER_ENABLE) {
        require('./module/KCServerWatcher').start()
      }
      //
      require('./module/Prototype')
      await require('./module/DiscordClient').start()
    } catch (err) {
      sendUrgentNotification(err)
    }
  }

}

module.exports = new MainProcess()

async function sendUrgentNotification(error) {
  //
  const orig = {
    email: ConfigVar.APP_SYSTEM_EMAIL_ADDRESS,
    pass: ConfigVar.APP_SYSTEM_EMAIL_PASSWORD
  }
  const dest = { to: ConfigVar.APP_OWNER_EMAIL_ADDRESS }
  const mailSubject = 'Heroku App "hito-verniy" Urgent Notification'
  const mailContent = error.stack
  //
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
  //
  try {
    const res = await transporter.sendMail(mailOptions)
    Logger.warn('EMAIL RES ' + JSON.stringify(res))
  } catch (err) {
    Logger.error(err)
  }
}
