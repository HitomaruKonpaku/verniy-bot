const Logger = require('./modules/Logger')

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
    require('./modules/Prototype').load()
    Logger.log('PROTOTYPE Load completed!')
}

function loadDiscord() {
    const DiscordClient = require('./modules/DiscordClient')
    const discord = new DiscordClient()
    discord.start()
}