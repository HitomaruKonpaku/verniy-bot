const CronJob = require('cron').CronJob
const Log = require('./logger')

// UTC +/-
const TIME_ZONE = 7

// cron data
const cronTimeZone = 'Asia/Ho_Chi_Minh'
const cronStart = false

// global var
var _channels

function initChannels(discord, filter) {
    _channels = discord.channels.filterArray(v =>
        v.type == 'text' &&
        new Set(filter).has(v.id)
    )
}

function sendMessage(message) {
    _channels.forEach(v => { v.send(message) })
}

// kc pvp cron
var cronPvp = new CronJob({
    cronTime: [
        '0',
        [0, 30, 45, 50, 55, 59].join(','),
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
            Log.debug({ date, hour, min, diff, msg })
            sendMessage(msg)
            return
        }

        msg = `${diff} minute${diff > 1 ? 's' : ''} before PvP reset`
        Log.debug({ date, hour, min, diff, msg })
        sendMessage(msg)
    },
    timeZone: cronTimeZone,
    start: cronStart,
})

// kc quest cron
// var cronQuest = new CronJob({})

module.exports = {
    run: discord => {
        Log.info('KC-CRON running...')
        initChannels(discord, [
            '422709303376609290',
            '376294828608061440',
            '421681074565939201',
        ])

        Log.info('Starting PvP cron')
        cronPvp.start()
    }
}