const { Command } = require('discord.js-commando')
const Logger = require('../../modules/Logger')

const _MSG = 'GoodEvening /'

module.exports = class GoodEveningCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ge',
            group: 'fun',
            memberName: 'ge',
            description: _MSG,
        })
    }

    async run(msg) {
        msg.channel
            .send(_MSG)
            .catch(err => Logger.error(err))
    }
}