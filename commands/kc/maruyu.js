const { Command } = require('discord.js-commando')
const KCData = require('../../_data/settings.json').KanColle

module.exports = class KCMaruyuCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'maruyu',
            group: 'kc',
            memberName: 'maruyu',
            description: 'Who to feed Maruyus?',
        })
    }

    async run(msg, args) {
        msg.channel.send(KCData.Maruyu)
    }
}