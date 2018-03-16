const { Command } = require('discord.js-commando')
const KC = require('../../_data/settings').KanColle

module.exports = class KCEscortModCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'demod',
            group: 'kc',
            memberName: 'demod',
            description: 'How mod ship using Escorts',
        })
    }

    async run(msg, args) {
        msg.channel.send(KC.EscortMod)
    }
}