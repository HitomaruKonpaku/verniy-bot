const CronJob = require('cron').CronJob
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
    console.log(msg)
    let channels = Util.getDiscordBroadcastChannel(_discord, _channels)
    channels.forEach(v => { v.send(msg) })
}

// kc pvp cron
var cronPvp = new CronJob({
    cronTime: [
        0,
        [0, 30, 55].join(','),
        [17, 18, 5, 6].map(v => (v + TIME_ZONE) % 24).join(','),
        '*', '*', '*',
    ].join(' '),
    onTick: () => {
        var date = new Date(),
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
var cronQuest = new CronJob({
    cronTime: [
        0, 0,
        (20 + TIME_ZONE) % 24,
        '*', '*', '*',
    ].join(' '),
    onTick: () => {
        var msg = 'Quest reset'
        sendMessage(msg)
    },
    timeZone: cronTimeZone,
    start: cronStart,
})

// kc ranking cron
// var cronRank = new CronJob({})

module.exports = {
    start: discord => {
        console.log('Running KC cron module...')

        _discord = discord
        _channels = [
            '422709303376609290',
            '376294828608061440',
            '421681074565939201',
        ]

        console.log('Starting PvP cron')
        cronPvp.start()

        console.log('Starting Quest cron')
        cronQuest.start()
    }
}