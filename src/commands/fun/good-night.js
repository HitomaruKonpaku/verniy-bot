const { Command } = require('discord.js-commando')

const MESSAGE = 'GoodNight /'

module.exports = class GoodNightCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'gn',
            group: 'fun',
            memberName: 'gn',
            description: MESSAGE,
        })
    }

    async run(msg) {
        return msg.reply(MESSAGE)
    }
}