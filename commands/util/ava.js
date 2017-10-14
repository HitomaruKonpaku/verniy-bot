const { Command } = require('discord.js-commando')

module.exports = class KCAsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ava',
            group: 'util',
            memberName: 'ava',
            description: 'Gets user\'s avatar URL',
            examples: [],
            argsType: 'single',
            args: [{
                key: 'user',
                prompt: '',
                type: 'user',
            }],
            wait: 10,
        })
    }

    async run(msg, args) {
        msg.channel.send(args.user.avatarURL)
    }
}