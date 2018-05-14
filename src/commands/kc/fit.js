const { Command } = require('discord.js-commando')
const KC = require('../../settings').KanColle
const Logger = require('../../modules/Logger')

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
        msg.channel
            .send(KC.GunFit)
            .catch(err => Logger.error(err))
    }
}