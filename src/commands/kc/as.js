const { Command } = require('discord.js-commando')
const KC = require('../../settings').KanColle

module.exports = class KCAirCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'as',
            group: 'kc',
            memberName: 'as',
            description: 'AirPower for boss route',
        })
    }

    async run(msg, args) {
        msg.channel.send(KC.AirPower)
    }
}