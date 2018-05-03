const { Command } = require('discord.js-commando')
const Logger = require('../../modules/Logger')

module.exports = class SomeoneCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'someone',
            group: 'util',
            memberName: 'someone',
            description: 'Get random user in current guild',
        })
    }

    async run(msg, args) {
        // this.client
    }
}