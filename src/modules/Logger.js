const log4js = require('log4js')

class Logger {

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production'

    log4js.configure({
      appenders: {
        out: {
          type: 'console',
          layout: {
            type: 'pattern',
            pattern: isProduction ? '%p %c - %m' : '%[%p %c%] - %m'
          }
        }
      },
      categories: {
        default: { appenders: ['out'], level: process.env.LOGGER_DEFAULT_LEVEL || 'debug' },
        Util: { appenders: ['out'], level: isProduction ? 'info' : 'debug' },
        Discord: { appenders: ['out'], level: 'debug' },
        DiscordGuild: { appenders: ['out'], level: 'debug' },
        DiscordMessage: { appenders: ['out'], level: 'debug' },
        DiscordCommand: { appenders: ['out'], level: 'debug' },
        Twitter: { appenders: ['out'], level: 'debug' },
        TwitterStream: { appenders: ['out'], level: 'debug' },
        Discord4User: { appenders: ['out'], level: 'debug' },
        Discord4UserMessage: { appenders: ['out'], level: 'debug' },
        KCCron: { appenders: ['out'], level: 'debug' },
        FbMessenger: { appenders: ['out'], level: isProduction ? 'info' : 'debug' },
        KCServerWatcher: { appenders: ['out'], level: 'info' }
      }
    })

    const logger = log4js.getLogger()
    logger.__proto__.error = new Proxy(logger.error, {
      async apply(target, thisArg, argList) {
        target.apply(thisArg, argList)
        const Util = require('./Util')
        const msg = [
          '```',
          'Category: ' + thisArg.category,
          [
            'Error: ',
            argList[0].stack ? argList[0].stack.split('\n').filter(line => !['internal', 'node_modules'].some(v => line.includes(v))).join('\n') : argList[0]
          ].join(''),
          '```'
        ].join('\n')
        await Util.Discord.sendWebhook({
          url: AppConst.APP_NOTIFICATION_DISCORD_WEBHOOK,
          message: msg
        })
      }
    })
  }

}

module.exports = new Logger()
