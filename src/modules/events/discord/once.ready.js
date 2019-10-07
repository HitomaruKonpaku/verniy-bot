const logger = require('log4js').getLogger('Discord')
const Util = require('../../Util')

module.exports = function(client) {
  return function() {
    // Client
    logger.info(`${client.user.tag} ONLINE!`)
    client.user.setActivity('.help', { type: 'PLAYING' })

    // Owners
    logger.info('Owners')
    client.owners
      .filter(v => !!v)
      .forEach(v => logger.info(`>> ${v.id} >> ${v.tag}`))

    // Guilds, Channels, Users
    logger.info(`Connected to ${client.guilds.size} guilds, ${client.channels.size} channels, ${client.users.size} users`)
    client.guilds.array().forEach(guild => {
      const botCount = guild.members.filter(member => member.user.bot).size
      logger.info('>> ' + [guild.name, guild.owner.user.tag, guild.memberCount - botCount + ' users', botCount + ' bots'].join('; '))
    })

    // Twitter
    if (AppConst.TWITTER_ENABLE) {
      const twitter = require('../../Twitter')
      if (AppConst.TWITTER_TWEET_ENABLE) {
        const config = Util.Twitter.transformTweetConfig(AppConfig.Twitter.Tweet)
        const follows = Object.keys(config)
        twitter.checkTweets(follows)
        twitter.on('tweet', require('../discord.twitter/on.tweet')(client, config))
      }
      if (AppConst.TWITTER_PROFILE_ENABLE) {
        const config = Util.Twitter.transformProfileConfig(AppConfig.Twitter.Profile)
        twitter.checkProfiles(config)
        twitter.on('profileChanged', require('../discord.twitter/on.profileChanged')(client, config))
      }
    }

    // Cron
    if (AppConst.CRON_ENABLE) {
      const cronKC = require('../../KCCron')
      const channels = AppConfig.Cron.KanColle
      cronKC.start()
      cronKC.on('message', msg => {
        logger.info('CronMessage: ' + msg)
        Util.Discord.sendMessageAsBot({ client, channels, message: msg })
      })
    }
  }
}
