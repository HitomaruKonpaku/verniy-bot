const { Command } = require('discord.js-commando')
const Logger = require('../../modules/Logger')

const _MSG = 'GoodMorning /'

module.exports = class GoodMorningCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'gm',
            group: 'fun',
            memberName: 'gm',
            description: _MSG,
        })
    }

    async run(msg) {
        msg.channel
            .send(_MSG)
            .catch(err => Logger.error(err))
    }
}