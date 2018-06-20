const { Command } = require('discord.js-commando')

module.exports = class UserAvaCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ava',
            group: 'user',
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
        const message = `<${args.user.avatarURL}>`
        return msg.say(message)
    }
}