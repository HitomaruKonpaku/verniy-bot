const { Command } = require('discord.js-commando')
const Logger = require('../../modules/Logger')

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

    async run(msg) {
        msg.channel
            .send(zuizui)
            .catch(err => Logger.error(err))
    }
}