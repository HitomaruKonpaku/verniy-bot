const { Command } = require('discord.js-commando')
const _MSG = 'GoodNight /'

module.exports = class GoodNightCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'gn',
            group: 'fun',
            memberName: 'gn',
            description: '',
        })
    }

    async run(msg, args) {
        msg.channel.send(_MSG)
    }
}