const { Command } = require('discord.js-commando')
const KC = require('../../settings').KanColle

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
        const message = KC.OverKill
        return msg.reply(message)
    }
}