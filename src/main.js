const Logger = require('./module/Logger')

module.exports = {
    start: function () {
        Logger.log('STARTING.....')
        loadProcessEnv()
        loadPrototype()
        loadDiscord()
    },
}

function loadProcessEnv() {
    Logger.log('PROCESSENV Loading...')
    require('dotenv').config()
    Logger.log('PROCESSENV Load completed!')
}

function loadPrototype() {
    Logger.log('PROTOTYPE Loading...')
    require('./module/Prototype').load()
    Logger.log('PROTOTYPE Load completed!')
}

function loadDiscord() {
    const DiscordClient = require('./module/DiscordClient')
    const discord = new DiscordClient()
    discord.start()
}