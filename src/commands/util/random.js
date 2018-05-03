const { Command } = require('discord.js-commando')
const Logger = require('../../modules/Logger')
const Util = require('../../modules/Util')

module.exports = class RandomCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rd',
            group: 'util',
            memberName: 'rd',
            description: 'Random number generator BlessRNG',
            examples: ['rd', 'rd 10', 'rd 1 10', 'rd 2 3 5'],
        })
    }

    async run(msg, args) {
        let numbers = args.split(' ')
        if (numbers.some(v => isNaN(v))) {
            msg.channel.send(`Invalid numbers`)
            return
        }

        const randomString = number => `:pray: ${number} :pray:`

        let min, max, random
        switch (numbers.length) {
            case 0:
                min = 0
                max = Number.MAX_SAFE_INTEGER
                break
            case 1:
                min = 0
                max = numbers[0]
                break
            case 2:
                min = numbers[0]
                max = numbers[1]
                break
            default:
                min = 0
                max = numbers.length - 1
                random = Util.getRandomNumber(min, max)
                msg.channel.send(randomString(numbers[random]))
                return
        }

        random = Util.getRandomNumber(min, max)
        msg.channel.send(randomString(random))
    }
}