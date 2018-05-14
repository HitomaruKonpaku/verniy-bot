const { Command } = require('discord.js-commando')
const KC = require('../../settings').KanColle
const Logger = require('../../modules/Logger')

module.exports = class KCOverKillCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'overkill',
            group: 'kc',
            memberName: 'overkill',
            description: 'Overkill protection',
        })
    }

    async run(msg) {
        msg.channel
            .send(KC.OverKill)
            .catch(err => Logger.error(err))
    }
}