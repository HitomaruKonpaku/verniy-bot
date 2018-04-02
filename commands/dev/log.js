const { Command } = require('discord.js-commando')

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
        console.error(args)
        console.warn(args)
        console.info(args)
        console.debug(args)
        console.trace(args)
        console.log(args)
    }
}