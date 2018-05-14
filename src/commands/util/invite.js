const { Command } = require('discord.js-commando')
const Discord = require('../../settings').Discord

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

    async run(msg) {
        const message = `<${Discord.InviteLink}>`
        return msg.say(message)
    }
}