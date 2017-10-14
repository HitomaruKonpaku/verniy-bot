const { Command } = require('discord.js-commando')
const KCData = require('../../_data/settings.json').KanColle

module.exports = class KCAsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'as',
            group: 'kc',
            memberName: 'as',
            description: 'Airpower for Boss Route',
        })
    }

    async run(msg, args) {
        msg.channel.send(KCData.AirPower)
    }
}