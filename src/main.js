const logger = require('log4js').getLogger()

class Main {

  constructor() {
    require('./modules/Logger')
    logger.info('Loaded Logger')

    try {
      global.AppConst = require('dotenv').config().parsed || process.env
      logger.info('Loaded AppConst')
      logger.trace(AppConst)

      global.AppConfig = require('./config')
      logger.info('Loaded AppConfig')
      logger.trace(AppConfig)

      require('./modules/Prototype')
      logger.info('Loaded Prototype')

      require('./modules/FileManager')
      logger.info('Loaded FileManager')
    } catch (err) {
      logger.error(err)
    }
  }

  async start() {
    try {
      if (AppConst.KCSERVERWATCHER_ENABLE) require('./modules.external/KCServerWatcher').start()
      await require('./modules/Discord').login()
      if (AppConst.FB_MESS_ENABLE) require('./modules/FbMessBot')
    } catch (err) {
      logger.error(err)
      // Send urgent email
      if (AppConst.APP_ERROR_EMAIL_ENABLE) {
        const Util = require('./modules/Util')
        Util.sendEmail({
          email: AppConst.APP_OWNER_EMAIL_ADDRESS,
          subject: 'Heroku App "hito-verniy" Urgent Notification',
          content: err.stack || err.message
        })
      }
    }
  }

}

module.exports = new Main()
