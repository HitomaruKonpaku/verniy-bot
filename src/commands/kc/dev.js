const { Command } = require('discord.js-commando')
const KC = require('../../settings').KanColle

module.exports = class KCDevelopmentCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'development',
            aliases: ['dev'],
            group: 'kc',
            memberName: 'development',
            description: 'Development quick guide',
        })
    }

    async run(msg) {
        const message = KC.Development
        return msg.say(message)
    }
}