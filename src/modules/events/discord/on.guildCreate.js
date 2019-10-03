const logger = require('log4js').getLogger('DiscordGuild')

module.exports = function(guild) {
  logger.info(`Joined: ${guild.name}`)
}
