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
    require('dotenv').config()
    Logger.log('ProcessEnv loaded!')
}

function loadPrototype() {
    require('./modules/Prototype').load()
    Logger.log('Prototype loaded!')
}

function loadDiscord() {
    const DiscordClient = require('./modules/DiscordClient')
    const discord = new DiscordClient()
    discord.start()
}