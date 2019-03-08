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
    //
    const role = args.role
    const members = role.members.array()
    //
    const msgMaxChar = 2000
    const msgHead = `Found **${members.length}** members with role **${role.name}**`
    const msgBlock = '```'
    const msgList = []
    const msgBuilder = [msgHead, msgBlock]
    // Generate multi messages
    members.forEach(v => {
      const name = v.user.tag
      const tmp = msgBuilder.concat(name, msgBlock).join('\n')
      if (tmp.length <= msgMaxChar) {
        msgBuilder.push(name)
        return
      }
      msgBuilder.push(msgBlock)
      msgList.push(msgBuilder.join('\n'))
      msgBuilder.splice(0, msgBuilder.length)
      msgBuilder.push(msgBlock, name)
    })
    // Append to last message
    msgBuilder.push(msgBlock)
    msgList.push(msgBuilder.join('\n'))
    // Send
    msgList.forEach(v => msg.direct(v))
  }
}
