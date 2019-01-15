const Discord = require('discord.js')
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
          wait: 10
        }
      ]
    })
  }

  async run(msg, args) {
    const bot = this.client.guilds.get(msg.guild.id).me
    const botRole = bot.roles.filterArray(v =>
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
      return msg.say('Can not remove higher priority role')
    }
    const member = msg.member
    return member
      .removeRole(guildRole)
      .then(() => msg.say('Done'))
  }
}
