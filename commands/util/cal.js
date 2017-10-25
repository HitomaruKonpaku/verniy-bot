const { Command } = require('discord.js-commando')

module.exports = class CalculationCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'cal',
            group: 'util',
            memberName: 'cal',
            description: 'Evaluates or executes an argument.',
            examples: ['cal 1+1', 'cal 2^2'],
            argsType: 'single',
        })
    }

    async run(msg, args) {
        let pattern = /^[0-9\ \+\-\*\/\&\|\!\^]+$/
        if (pattern.test(args)) {
            msg.channel.send(eval(args))
        } else {
            msg.channel.send('Invalid!')
        }
    }
}