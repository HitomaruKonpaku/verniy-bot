const CronJob = require('cron').CronJob
const Logger = require('./Logger')
const Util = require('./Util')

// UTC +/-
const TIME_ZONE = 7

// cron data
const cronTimeZone = 'Asia/Ho_Chi_Minh'
const cronStart = false

// Global
let _discord
let _channels

function sendMessage(msg) {
    Logger.log(msg)
    let channels = Util.getDiscordBroadcastChannel(_discord, _channels)
    channels.forEach(v => { v.send(msg) })
}

// kc pvp cron
let cronPvp = new CronJob({
    cronTime: [
        0,
        [0, 30, 55].join(','),
        [17, 18, 5, 6].map(v => (v + TIME_ZONE) % 24).join(','),
        '*', '*', '*',
    ].join(' '),
    onTick: () => {
        let date = new Date(),
            hour = (date.getUTCHours() + TIME_ZONE) % 24,
            min = date.getUTCMinutes(),
            diff = 60 - min,
            msg

        if (hour == 1 || hour == 13) {
            if (min != 0) { return }
            msg = `PvP reset`
            sendMessage(msg)
            return
        }

        msg = `${diff} minute${diff > 1 ? 's' : ''} before PvP reset`
        sendMessage(msg)
    },
    timeZone: cronTimeZone,
    start: cronStart,
})

// kc quest cron
let cronQuest = new CronJob({
    cronTime: [
        0, 0,
        (20 + TIME_ZONE) % 24,
        '*', '*', '*',
    ].join(' '),
    onTick: () => {
        let msg = 'Quest reset'
        sendMessage(msg)
    },
    timeZone: cronTimeZone,
    start: cronStart,
})

module.exports = {
    start: discord => {
        Logger.log('Starting cron module')

        _discord = discord
        _channels = [
            '422709303376609290',
            '376294828608061440',
            '421681074565939201',
        ]

        Logger.log('Starting PvP cron')
        cronPvp.start()

        Logger.log('Starting Quest cron')
        cronQuest.start()
    }
}