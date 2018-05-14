const { Command } = require('discord.js-commando')
const Discord = require('../../settings').Discord
const Logger = require('../../modules/Logger')

module.exports = class BotInviteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'invite',
            group: 'util',
            memberName: 'invite',
            description: 'Get bot invite link',
            guarded: true,
        })
    }

    async run(msg, args) {
        msg.channel
            .send(`<${Discord.InviteLink}>`)
            .catch(err => Logger.error(err))
    }
}