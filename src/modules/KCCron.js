const EventEmitter = require('events')
const CronJob = require('cron').CronJob

const logger = require('log4js').getLogger('KCCron')

class KCCron extends EventEmitter {

  constructor() {
    super()
    const config = AppConfig.Global
    const timeZone = config.TimeZone
    const timeZoneOffset = config.TimeZoneOffset
    const startDefault = false
    const messages = {
      Daily: {
        0: {
          0: '60 minutes before PvP reset',
          30: '30 minutes before PvP reset',
          45: '15 minutes before PvP reset',
          55: '5 minutes before PvP reset'
        },
        1: {
          0: 'PvP reset'
        },
        3: {
          0: 'Quest reset'
        },
        12: {
          0: '60 minutes before PvP reset',
          30: '30 minutes before PvP reset',
          45: '15 minutes before PvP reset',
          55: '5 minutes before PvP reset'
        },
        13: {
          0: 'PvP reset'
        },
        21: {
          30: '30 minutes before Akashi\'s Improvement reset'
        },
        22: {
          0: 'Akashi\'s Improvement reset'
        }
      }
    }

    this.CronDaily = new CronJob({
      cronTime: [0, '*', '*', '*', '*', '*'].join(' '),
      onTick: () => {
        const date = new Date(new Date().getTime() + timeZoneOffset * 3600000)
        const hh = date.getUTCHours()
        const mm = date.getUTCMinutes()
        const msg = (messages.Daily[hh] || {})[mm]
        if (!msg) return
        this.emit('message', msg)
      },
      timeZone: timeZone,
      start: startDefault
    })
  }

  start() {
    logger.log('Started')
    this.CronDaily.start()
  }

  stop() {
    logger.log('Stopped')
    this.CronDaily.stop()
  }

}

module.exports = new KCCron()
