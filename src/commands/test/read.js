const { Command } = require('discord.js-commando')
const fs = require('fs')

module.exports = class ReadFileCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'read',
      group: 'test',
      memberName: 'read',
      description: 'Read file'
    })
  }

  async run(msg) {
    const file = 'data.txt'
    if (!fs.existsSync(file)) fs.writeFileSync(file, '')
    const data = fs.readFileSync(file, { encoding: 'utf8' })
    if (!data) return
    return msg.say(data)
  }
}
