const { Command } = require('discord.js-commando')

const MESSAGE = 'GoodMorning /'

module.exports = class GoodMorningCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'gm',
            group: 'fun',
            memberName: 'gm',
            description: MESSAGE,
        })
    }

    async run(msg) {
        return msg.reply(MESSAGE)
    }
}