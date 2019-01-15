const EventEmitter = require('events')
const CronJob = require('cron').CronJob
const Setting = require('../setting')
const Logger = require('../module/Logger')

class CronKC extends EventEmitter {
  constructor() {
    super()
    Logger.log('CRON CronKC constructor')

    const Timezone = Setting.Global.Timezone
    const TimezoneOffset = Setting.Global.TimezoneOffset
    const StartDefault = false

    const Message = {
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
      cronTime: [
        0,
        '*', '*',
        '*', '*', '*'
      ].join(' '),
      onTick: () => {
        const date = new Date(new Date().getTime() + TimezoneOffset * 3600000)
        const hh = date.getUTCHours()
        const mm = date.getUTCMinutes()
        const msg = (Message.Daily[hh] || {})[mm]
        if (!msg) return
        this.emit('message', msg)
      },
      timeZone: Timezone,
      start: StartDefault
    })
  }
  start() {
    Logger.log('CRON CronKC.CronDaily start')
    this.CronDaily.start()
  }
  stop() {
    Logger.log('CRON CronKC.CronDaily stop')
    this.CronDaily.stop()
  }
}

module.exports = CronKC
