const { Command } = require('discord.js-commando')
const KC = require('../../_data/settings').KanColle

module.exports = class KCZuiCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'zui',
            group: 'kc',
            memberName: 'zui',
            description: 'ｽﾞｲ₍₍(ง˘ω˘)ว⁾⁾ｽﾞｲ',
        })
    }

    async run(msg, args) {
        msg.channel.send('ｽﾞｲ₍₍(ง˘ω˘)ว⁾⁾ｽﾞｲ')
    }
}