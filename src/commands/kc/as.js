const { Command } = require('discord.js-commando')
const KC = require('../../settings').KanColle

module.exports = class KCAirCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'as',
            group: 'kc',
            memberName: 'as',
            description: 'AirPower of normal map',
        })
    }

    async run(msg) {
        const message = KC.AirPower
        return msg.say(message)
    }
}