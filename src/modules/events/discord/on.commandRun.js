const logger = require('log4js').getLogger('DiscordCommand')

module.exports = async function(command, promise, message) {
  const reply = await promise
  if (Array.isArray(reply)) {
    return
  }
  try {
    await reply.react('❌')
    reply
      .awaitReactions(
        (reaction, user) => reaction.emoji.name === '❌' && user.id === message.author.id,
        { max: 1, time: 15 * 1000, errors: ['time'] }
      )
      .then(() => reply.delete())
      .catch(() => reply.reactions.forEach(reaction => reaction.me ? reaction.remove() : 0))
  } catch (err) {
    logger.error(err)
  }
}
