const { Command } = require('discord.js-commando')
const KC = require('../../settings').KanColle

module.exports = class KCOverKillCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'overkill',
            group: 'kc',
            memberName: 'overkill',
            description: '',
        })
    }

    async run(msg, args) {
        msg.channel.send(KC.OverKill)
    }
}