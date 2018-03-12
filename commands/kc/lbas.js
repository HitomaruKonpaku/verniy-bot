const { Command } = require('discord.js-commando')
const KC = require('../../_data/settings').KanColle

module.exports = class KCLbasCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'lb',
            group: 'kc',
            memberName: 'lb',
            description: '',
        })
    }

    async run(msg, args) {
        msg.channel.send(KC.LBAS)
    }
}