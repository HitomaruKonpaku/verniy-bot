const { Command } = require('discord.js-commando')
const Logger = require('../../modules/logger')

module.exports = class LogCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'log',
            group: 'dev',
            memberName: 'log',
            description: 'Log',
        })
    }

    async run(msg, args) {
        Logger.log({ level: 'error', data: 'ERROR TEST', more: { a: 1, b: 2 } })
        Logger.log({ level: 'debug', data: 'ERROR TEST', more: { a: 1, b: 2 } })
    }
}