const { Command } = require('discord.js-commando')
const KC = require('../../setting').KanColle

module.exports = class KCAkashiCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'akashi',
            aliases: [],
            group: 'kc',
            memberName: 'akashi',
            description: 'Akashi List',
        })
    }

    async run(msg) {
        const message = KC.Akashi
        return msg.say(message)
    }
}