const { Command } = require('discord.js-commando')
const KC = require('../../settings').KanColle
const Logger = require('../../modules/Logger')

module.exports = class KCLbasCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'lb',
            group: 'kc',
            memberName: 'lb',
            description: 'Land Base Aerial Support',
        })
    }

    async run(msg) {
        msg.channel
            .send(KC.LBAS)
            .catch(err => Logger.error(err))
    }
}