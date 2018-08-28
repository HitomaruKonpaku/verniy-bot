const Discord = require('discord.js')
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
        const bot = this.client.guilds.get(msg.guild.id).me
        const botRole = bot.roles.filter(v =>
            new Discord.Permissions(v.permissions)
                .has(Discord.Permissions.FLAGS.MANAGE_ROLES)
        )[0]
        if (botRole === undefined) {
            return msg.say('Missing permission **MANAGE ROLES**')
        }
        const botRolePosition = botRole.calculatedPosition
        const guildRole = args.role
        const guildRolePosition = guildRole.calculatedPosition
        if (botRolePosition <= guildRolePosition) {
            return msg.say('Can not add higher priority role')
        }
        const member = msg.member
        return member
            .addRole(guildRole)
            .then(() => msg.say('Done'))
    }
}