const CronJob = require('cron').CronJob
const Log = require('./logger')

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

var cronPvp = new CronJob({
    // cronTime: '* * * * * *',
    cronTime: '0 0,30,45,50,55,58,59 0,1,12,13 * * *',
    onTick: () => {
        var date = new Date(),
            hour = (date.getUTCHours() + 7) % 24,
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

        msg = `${diff} minutes before PvP reset`
        Log.debug({ date, hour, min, diff, msg })
        sendMessage(msg)
    },
    timeZone: 'Asia/Ho_Chi_Minh',
    start: false,
})

module.exports = {
    run: discord => {
        Log.info('KC-CRON running...')
        initChannels(discord, [
            '422709303376609290',
            '376294828608061440'
        ])

        Log.info('Starting PvP cron')
        cronPvp.start()
    }
}