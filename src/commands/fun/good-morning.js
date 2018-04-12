const { Command } = require('discord.js-commando')
const _MSG = 'GoodMorning /'

module.exports = class GoodMorningCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'gm',
            group: 'fun',
            memberName: 'gm',
            description: '',
        })
    }

    async run(msg, args) {
        msg.channel.send(_MSG)
    }
}