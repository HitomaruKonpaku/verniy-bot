const Logger = require('./module/Logger')

module.exports = {
    start: function () {
        Logger.log('STARTING.....')
        loadPrototype()
        loadDiscord()
    },
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