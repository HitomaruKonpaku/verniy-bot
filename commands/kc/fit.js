const { Command } = require('discord.js-commando')
const KC = require('../../_data/settings').KanColle

module.exports = class KCGunFitCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'fit',
            group: 'kc',
            memberName: 'fit',
            description: 'Gun fit table',
        })
    }

    async run(msg, args) {
        msg.channel.send(KC.GunFit)
    }
}