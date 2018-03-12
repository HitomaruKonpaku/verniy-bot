const { Command } = require('discord.js-commando')
const KC = require('../../_data/settings').KanColle

module.exports = class KCAkashiCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'akashi',
            group: 'kc',
            memberName: 'akashi',
            description: 'Akashi List',
        })
    }

    async run(msg, args) {
        msg.channel.send('http://akashi-list.me/')
    }
}