const { Command } = require('discord.js-commando')
const KCData = require('../../_data/settings.json').KanColle

module.exports = class KCDevCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'dev',
            group: 'kc',
            memberName: 'dev',
            description: 'Development',
        })
    }

    async run(msg, args) {
        msg.channel.send(KCData.Development)
    }
}