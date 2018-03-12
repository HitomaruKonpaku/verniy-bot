const { Command } = require('discord.js-commando')
const KC = require('../../_data/settings').KanColle

module.exports = class KCAirCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'as',
            group: 'kc',
            memberName: 'as',
            description: '',
        })
    }

    async run(msg, args) {
        msg.channel.send(KC.AirPower)
    }
}