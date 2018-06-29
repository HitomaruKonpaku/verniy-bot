const { Command } = require('discord.js-commando')
const KC = require('../../settings').KanColle

module.exports = class KCGunCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'gun',
            group: 'kc',
            memberName: 'gun',
            description: 'Gun bonus stats',
        })
    }

    async run(msg) {
        const message = KC.Gun
        return msg.say(message)
    }
}