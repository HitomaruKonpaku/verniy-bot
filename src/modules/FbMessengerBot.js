const logger = require('log4js').getLogger('FbMessenger')
const { Client } = require('libfb')

class FbMessBot {

  constructor() {
    logger.info('Constructor')
    this.client = new Client({ selfListen: true })
  }

  async start() {
    const client = this.client
    if (client.loggedIn) {
      return
    }

    const email = AppConst.FB_EMAIL
    const password = AppConst.FB_PASSWORD
    if (!email || !password) {
      logger.warn('Missing FB_EMAIL or FB_PASSWORD')
      return
    }

    try {
      logger.info('Connecting...')
      await client.login(email, password)
      logger.info('Connected!')
      client.on('message', require('./events/facebook.messenger/on.message')(client))
      client.on('command', require('./events/facebook.messenger/on.command')(client))
    } catch (err) {
      logger.error(err)
    }
  }

}

module.exports = new FbMessBot()
