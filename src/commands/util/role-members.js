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
        const role = args.role
        const members = role.members
        const message = [
            `Found **${members.size}** members with role **${role.name}**`,
            '```',
            members.map(v => `${v.displayName}`).join('\n'),
            '```',
        ].join('\n')
        return msg.say(message)
    }
}