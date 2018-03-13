const { Command } = require('discord.js-commando')

const zuizui = 'ｽﾞｲ₍₍(ง˘ω˘)ว⁾⁾ｽﾞｲ'

module.exports = class KCZuiCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'zui',
            group: 'kc',
            memberName: 'zui',
            description: zuizui,
        })
    }

    async run(msg, args) {
        msg.channel.send(zuizui)
    }
}