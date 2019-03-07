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
      // Send urgent mail
      require('./module/Util').sendEmail({
        email: ConfigVar.APP_OWNER_EMAIL_ADDRESS,
        subject: 'Heroku App "hito-verniy" Urgent Notification',
        content: err.stack || err.message
      })
    }
  }

}

module.exports = new MainProcess()
