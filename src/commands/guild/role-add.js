const { Command } = require('discord.js-commando')

module.exports = class RoleAddCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ra',
            group: 'guild',
            memberName: 'ra',
            description: 'Add role to member',
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
        const member = msg.member
        member.addRole(role.id)
            .then(() => console.log('Done'))
            .catch(() => console.log('Error'))
    }
}