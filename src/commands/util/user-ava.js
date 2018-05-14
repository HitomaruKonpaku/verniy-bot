const { Command } = require('discord.js-commando')
const Logger = require('../../modules/Logger')

module.exports = class UserAvaCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ava',
            group: 'util',
            memberName: 'ava',
            description: 'Check user ava',
            args: [
                {
                    key: 'user',
                    prompt: 'User?',
                    type: 'user',
                    wait: 10,
                },
            ],
        })
    }

    async run(msg, args) {
        msg.channel
            .send(`<${args.user.avatarURL}>`)
            .catch(err => Logger.error(err))
    }
}