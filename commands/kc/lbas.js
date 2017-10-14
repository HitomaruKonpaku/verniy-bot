const { Command } = require('discord.js-commando')
const KCData = require('../../_data/settings.json').KanColle

module.exports = class KCLbasCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'lb',
            group: 'kc',
            memberName: 'lb',
            description: 'Land Base Aerial Support',
        })
    }

    async run(msg, args) {
        msg.channel.send(KCData.LBAS)
    }
}