const { Command } = require('discord.js-commando')

module.exports = class RoleMembersCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'rm',
      aliases: [],
      group: 'guild',
      memberName: 'rm',
      description: 'List of members by role',
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
    const role = args.role
    const members = role.members.array()
    const msgHead = `Found **${members.length}** members with role **${role.name}**`
    const msgBlock = '```'
    const msgContent = [
      msgHead,
      msgBlock,
      members.map(v => v.user.tag).join('\n'),
      msgBlock
    ].join('\n')
    // Response
    const res = await msg.direct(msgContent)
    const resOpt = { timeout: 120000 }
    // Delete single message
    if (!res.length) {
      await res.delete(resOpt)
      return
    }
    // Delete multiple messages
    res.forEach(async v => v.delete(resOpt))
  }
}
