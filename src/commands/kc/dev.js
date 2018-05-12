const { Command } = require('discord.js-commando')
const KC = require('../../settings').KanColle
const Logger = require('../../modules/Logger')

module.exports = class KCDevCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'dev',
            group: 'kc',
            memberName: 'dev',
            description: 'Development quick guide',
        })
    }

    async run(msg, args) {
        msg.channel
            .send(KC.Development)
            .catch(err => Logger.error(err))
    }
}