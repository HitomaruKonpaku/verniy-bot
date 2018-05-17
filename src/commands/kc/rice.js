const { Command } = require('discord.js-commando')
const KC = require('../../settings').KanColle

module.exports = class KCAkashiCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rice',
            group: 'kc',
            memberName: 'rice',
            description: 'RICE, ~~UMEBOSHI, NORI, TEA~~ drop rate!',
        })
    }

    async run(msg) {
        const message = KC.Rice
        return msg.say(message)
    }
}