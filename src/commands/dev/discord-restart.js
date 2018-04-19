const { Command } = require('discord.js-commando')
const Logger = require('../../modules/Logger')
const DiscordClient = require('../../modules/DiscordClient')

module.exports = class DiscordRestartCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'restart',
            group: 'dev',
            memberName: 'restart',
            description: '',
        })
    }

    async run(msg, args) {
        let isOwner = this.client.isOwner(msg.author)
        if (!isOwner) {
            return
        }
        Logger.warn('DISCONNECTING')

        try {
            this.client.destroy()
        } catch (err) {
            Logger.log(err)
        } finally {
            const restartInSec = 10
            Logger.log(`Restart Discord in ${restartInSec} seconds`)
            setTimeout(() => {
                new DiscordClient().start()
            }, 1000 * restartInSec)
        }
    }
}