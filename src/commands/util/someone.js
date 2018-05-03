const { Command } = require('discord.js-commando')
const Logger = require('../../modules/Logger')

module.exports = class SomeoneCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'someone',
            group: 'util',
            memberName: 'someone',
            description: 'Get random user in current guild',
            guildOnly: true,
        })
    }

    async run(msg, args) {
        const members = msg.guild.members.random(1)
        const name = members[0].displayName
        msg.channel.send(this.message(name))
    }

    message(data) {
        return `:arrow_right: ${data}`
    }
}