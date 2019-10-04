const { Command } = require('discord.js-commando')

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

  }
}
