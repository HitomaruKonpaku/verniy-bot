const logger = require('log4js').getLogger()

class Main {

  constructor() {
    require('./modules/Logger')
    logger.info('Loaded Logger')

    try {
      global.AppConst = require('dotenv').config().parsed || process.env
      logger.info('Loaded AppConst')
      logger.debug(JSON.stringify(AppConst))

      global.AppConfig = require('./config')
      logger.info('Loaded AppConfig')
      logger.debug(JSON.stringify(AppConfig))

      require('./modules/Prototype')
      logger.info('Loaded Prototype')

      if (AppConst.KCSERVERWATCHER_ENABLE) require('./modules.external/KCServerWatcher').start()
      require('./modules/Discord').login()
    } catch (err) {
      logger.error(err)
      // Send urgent email
      if (AppConst.APP_ERROR_EMAIL_ENABLE) {
        require('./modules/Util').sendEmail({
          email: AppConst.APP_OWNER_EMAIL_ADDRESS,
          subject: 'Heroku App "hito-verniy" Urgent Notification',
          content: err.stack || err.message
        })
      }
    }
  }

}

module.exports = new Main()
