const { Command } = require('discord.js-commando')
const Logger = require('../../modules/Logger')

const _MSG = 'GoodAfternoon /'

module.exports = class GoodAfternoonCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ga',
            group: 'fun',
            memberName: 'ga',
            description: '',
        })
    }

    async run(msg, args) {
        msg.channel
            .send(_MSG)
            .catch(err => Logger.error(err))
    }
}