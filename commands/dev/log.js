import { log } from 'util';

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
        var msg = 'Process exited with status 143'
        Logger.log(msg)
        Logger.debug(msg)
        Logger.error(msg)
    }
}