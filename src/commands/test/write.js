const { Command } = require('discord.js-commando')
const fs = require('fs')

module.exports = class WriteFileCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'write',
      group: 'test',
      memberName: 'write',
      description: 'Write file'
    })
  }

  async run(msg) {
    const file = 'data.txt'
    const data = msg.argString.trim()
    fs.writeFileSync(file, data)
  }
}
