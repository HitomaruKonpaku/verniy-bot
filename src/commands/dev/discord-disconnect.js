const { Command } = require('discord.js-commando')
const Logger = require('../../modules/Logger')

module.exports = class DiscordDisconnectCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'disconnect',
            group: 'dev',
            memberName: 'disconnect',
            description: '',
            guarded: true,
        })
    }

    async run(msg, args) {
        let isOwner = this.client.isOwner(msg.author)
        if (!isOwner) {
            return
        }
        Logger.warn('DISCONNECTING')
        this.client.destroy()
        process.exit()
    }
}