const { Command } = require('discord.js-commando')

module.exports = class UserAvatarCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'avatar',
            aliases: ['ava'],
            group: 'user',
            memberName: 'avatar',
            description: 'Check user avatar',
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