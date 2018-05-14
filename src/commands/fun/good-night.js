const { Command } = require('discord.js-commando')
const Logger = require('../../modules/Logger')

const _MSG = 'GoodNight /'

module.exports = class GoodNightCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'gn',
            group: 'fun',
            memberName: 'gn',
            description: _MSG,
        })
    }

    async run(msg) {
        msg.channel
            .send(_MSG)
            .catch(err => Logger.error(err))
    }
}