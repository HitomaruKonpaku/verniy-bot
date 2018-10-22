const { Command } = require('discord.js-commando')

const MESSAGE = 'GoodEvening /'

module.exports = class GoodEveningCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ge',
            group: 'fun',
            memberName: 'ge',
            description: MESSAGE,
        })
    }

    async run(msg) {
        return msg.say(MESSAGE)
    }
}