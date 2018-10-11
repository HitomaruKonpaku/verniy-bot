const { Command } = require('discord.js-commando')
const KC = require('../../settings').KanColle

module.exports = class KCGunFitCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'fit',
            aliases: [],
            group: 'kc',
            memberName: 'fit',
            description: 'Large gun fit table',
        })
    }

    async run(msg) {
        const message = KC.GunFit
        return msg.say(message)
    }
}