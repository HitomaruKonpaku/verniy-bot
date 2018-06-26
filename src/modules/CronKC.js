const EventEmitter = require('events')
const CronJob = require('cron').CronJob
const Settings = require('../settings')
const Logger = require('../modules/Logger')

class CronKC extends EventEmitter {
    constructor() {
        super()
        Logger.log('CRON CronKC constructor')

        const Timezone = Settings.Global.Timezone
        const TimeZoneOffset = Settings.Global.TimezoneOffset
        const StartDefault = false

        const Message = {
            Daily: {
                0: {
                    0: '60 minutes before PvP reset',
                    30: '30 minutes before PvP reset',
                    45: '15 minutes before PvP reset',
                    55: '5 minutes before PvP reset',
                },
                1: {
                    0: 'PvP reset',
                },
                3: {
                    0: 'Quest reset',
                },
                12: {
                    0: '60 minutes before PvP reset',
                    30: '30 minutes before PvP reset',
                    45: '15 minutes before PvP reset',
                    55: '5 minutes before PvP reset',
                },
                13: {
                    0: 'PvP reset',
                },
                21: {
                    30: '30 minutes before Akashi\'s Improvement reset',
                },
                22: {
                    0: 'Akashi\'s Improvement reset',
                },
            },
        }

        this.CronDaily = new CronJob({
            cronTime: [
                0,
                '*', '*',
                '*', '*', '*',
            ].join(' '),
            onTick: () => {
                const date = new Date()
                const hour = (date.getUTCHours() + TimeZoneOffset) % 24
                const min = date.getUTCMinutes()
                if (!Message.Daily[hour] || !Message.Daily[hour][min]) return
                const msg = Message.Daily[hour][min]
                this.emit('message', msg)
            },
            timeZone: Timezone,
            start: StartDefault,
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