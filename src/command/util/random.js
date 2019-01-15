const { Command } = require('discord.js-commando')
const Logger = require('../../module/Logger')
const Util = require('../../module/Util')

module.exports = class RandomCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'random',
      aliases: ['rd'],
      group: 'util',
      memberName: 'rd',
      description: 'Random number generator BlessRNG',
      examples: ['rd', 'rd 10', 'rd 1 10', 'rd 2 3 5 7']
    })
  }

  async run(msg, args) {
    let numbers = args.trim().split(' ')
    if (numbers.some(v => isNaN(v))) {
      msg.say('Invalid numbers')
      return
    }

    let min, max, random
    switch (numbers.length) {
    case 1:
      min = 0
      max = numbers[0] != '' ? numbers[0] : 1E6
      break
    case 2:
      min = numbers[0]
      max = numbers[1]
      break
    default:
      min = 0
      max = numbers.length - 1
      random = Util.getRandomNumber(min, max)
      Logger.log(`RNG > Index ${random} of array ${numbers.length} elements > Value ${numbers[random]}`)
      return msg.say(this.message(numbers[random]))
    }

    random = Util.getRandomNumber(min, max)
    return msg.say(this.message(random))
  }

  message(data) {
    return `:pray: ${data} :pray:`
  }
}
