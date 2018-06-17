const { Command } = require('discord.js-commando')

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'say',
            group: 'dev',
            memberName: 'say',
            description: '',
        })
    }

    async run(msg, args) {
        return msg.say(args)
    }
}