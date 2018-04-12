const { Command } = require('discord.js-commando')

module.exports = class RandomCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rd',
            group: 'util',
            memberName: 'rd',
            description: 'Random number generator BlessRNG',
            examples: ['rd', 'rd 1 10'],
            args: [
                {
                    key: 'min',
                    prompt: 'Min value?',
                    type: 'integer',
                    default: 1,
                    min: Number.MIN_SAFE_INTEGER,
                    max: Number.MAX_SAFE_INTEGER,
                },
                {
                    key: 'max',
                    prompt: 'Max value?',
                    type: 'integer',
                    default: Math.pow(10, 6),
                    min: Number.MIN_SAFE_INTEGER,
                    max: Number.MAX_SAFE_INTEGER,
                },
            ]
        })
    }

    async run(msg, args) {
        var min = args.min,
            max = args.max,
            random = Math.floor(Math.random() * (max - min + 1) + min)

        console.log(`RNG - min: ${min} max: ${max} result: ${random}`)
        msg.channel.send(`:pray: ${random} :pray:`)
    }
}