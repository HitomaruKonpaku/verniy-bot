const logger = require('log4js').getLogger('FbMessenger')
const { Client } = require('libfb')
const Util = require('./Util')

class FbMessBot {

  constructor() {
    logger.info('Constructor')
    this.client = new Client({
      selfListen: true,
      session: {
        deviceId: {
          clientId: 'b2f08501-0761-4c89-a',
          deviceId: 'b2f08501-0761-4c89-a3b3-89b497020618',
          mqttId: 4242538554481811
        },
        tokens: {
          machine_id: '5hGjXSk-a8nKpq4QQT3ulWvA'
        }
      }
    })
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

      const twitter = require('./Twitter')
      twitter.on('profileChanged', require('./events/facebook.messenger.twitter/on.profileChanged')(client, Util.Twitter.transformProfileConfig(AppConfig.Twitter.Profile)))
    } catch (err) {
      logger.error(err)
    }
  }

}

module.exports = new FbMessBot()
