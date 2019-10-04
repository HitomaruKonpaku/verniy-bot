const { Command } = require('discord.js-commando')

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

  }
}
