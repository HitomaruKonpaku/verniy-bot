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

    async run(msg) {
        const members = msg.channel.members.random(1)
        const name = members[0].displayName
        msg.channel
            .send(this.message(name))
            .catch(err => Logger.error(err))
    }

    message(data) {
        return `:arrow_right: ${data}`
    }
}