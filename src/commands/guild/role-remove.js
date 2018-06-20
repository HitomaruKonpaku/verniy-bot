const { Command } = require('discord.js-commando')

module.exports = class RoleRemoveCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rr',
            group: 'guild',
            memberName: 'rr',
            description: 'Remove role from member',
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
        member.removeRole(role.id)
            .then(() => console.log('Done'))
            .catch(() => console.log('Error'))
    }
}