const { Command } = require('discord.js-commando')
const KC = require('../../settings').KanColle
const Logger = require('../../modules/Logger')

module.exports = class KCAkashiCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'akashi',
            group: 'kc',
            memberName: 'akashi',
            description: 'Akashi List',
        })
    }

    async run(msg, args) {
        msg.channel
            .send(KC.Akashi)
            .catch(err => Logger.error(err))
    }
}