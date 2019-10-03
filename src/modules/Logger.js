const log4js = require('log4js')

class Logger {

  constructor() {
    log4js.configure({
      appenders: {
        out: {
          type: 'console',
          layout: {
            type: 'pattern',
            pattern: '%[%p %c%] - %m'
          }
        }
      },
      categories: {
        default: { appenders: ['out'], level: 'debug' },
        Util: { appenders: ['out'], level: 'debug' },
        Discord: { appenders: ['out'], level: 'debug' },
        DiscordGuild: { appenders: ['out'], level: 'debug' },
        DiscordMessage: { appenders: ['out'], level: 'debug' },
        DiscordCommand: { appenders: ['out'], level: 'debug' },
        Twitter: { appenders: ['out'], level: 'debug' },
        TwitterStream: { appenders: ['out'], level: 'debug' },
        Discord4User: { appenders: ['out'], level: 'debug' },
        Discord4UserMessage: { appenders: ['out'], level: 'debug' },
        KCCron: { appenders: ['out'], level: 'debug' },
        KCServerWatcher: { appenders: ['out'], level: 'info' }
      }
    })

    const logger = log4js.getLogger()
    logger.__proto__.error = new Proxy(logger.error, {
      async apply(target, thisArg, argList) {
        target.apply(thisArg, argList)
        const msg = [
          '```',
          [
            'Error: ',
            argList[0].stack.split('\n').filter(line => !['internal', 'node_modules'].some(phase => line.includes(phase))).join('\n') || argList[0]
          ].join(''),
          '```'
        ].join('\n')
        await require('./Util').sendDiscordWebhook({
          url: AppConst.APP_NOTIFICATION_DISCORD_WEBHOOK,
          message: msg
        })
      }
    })
  }

}

module.exports = new Logger()
