const { Command } = require('discord.js-commando')

module.exports = class RoleMembersCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rm',
            group: 'util',
            memberName: 'rm',
            description: 'List of members by role',
            guildOnly: true,
            args: [
                {
                    key: 'role',
                    prompt: 'Role?',
                    type: 'role',
                    wait: 10,
                },
            ],
        })
    }

    async run(msg, args) {
        const members = args.role.members
        const message = [
            `Found ${members.size} members`,
            members.map(v => `> ${v.displayName}`).join('\n'),
        ].join('\n')
        return msg.say(message)
    }
}