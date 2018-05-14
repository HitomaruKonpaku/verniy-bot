const { Command } = require('discord.js-commando')
const KC = require('../../settings').KanColle

module.exports = class KCGunFitCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'fit',
            group: 'kc',
            memberName: 'fit',
            description: 'Gun fit table',
        })
    }

    async run(msg) {
        const message = KC.GunFit
        return msg.reply(message)
    }
}