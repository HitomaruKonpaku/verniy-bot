const logger = require('log4js').getLogger('DiscordCommand')
const { Permissions } = require('discord.js')

module.exports = async function (command, promise, message) {
  if (!message.channel.permissionsFor(this.user).has(Permissions.FLAGS.ADD_REACTIONS)) return

  const res = await promise
  if (!res) {
    return
  }

  if (Array.isArray(res)) {
    return
  }

  const reply = res
  try {
    await reply.react('❌')
    reply
      .awaitReactions(
        (reaction, user) => reaction.emoji.name === '❌' && (this.isOwner(user) || user.id === message.author.id),
        { max: 1, time: 15 * 1000, errors: ['time'] }
      )
      .then(() => reply.delete())
      .catch(() => reply.reactions.forEach(reaction => reaction.me ? reaction.remove() : 0))
  } catch (err) {
    logger.error(err)
  }
}
