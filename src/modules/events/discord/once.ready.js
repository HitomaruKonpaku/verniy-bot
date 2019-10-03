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
      .forEach(v => logger.info(`# ${v.id} >> ${v.tag}`))

    // Twitter
    if (AppConst.TWITTER_ENABLE) {
      const twitter = require('../../Twitter')
      if (AppConst.TWITTER_TWEET_ENABLE) {
        const config = transformTwitterTweetSetting(AppConfig.Twitter.Tweet)
        const follows = Object.keys(config)
        twitter.checkTweets(follows)
        twitter.on('tweet', require('../discord.twitter/on.tweet')(client, config))
      }
      if (AppConst.TWITTER_PROFILE_ENABLE) {
        const config = transformTwitterProfileSetting(AppConfig.Twitter.Profile)
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
        Util.sendDiscordMessageAsBot({ client, channels, message: msg })
      })
    }
  }
}

function transformTwitterTweetSetting(raw) {
  const o = {}
  raw.forEach(v => v.follows.forEach(follow => {
    // Create follow user object
    if (!o[follow]) { o[follow] = {} }
    // Loop channels object
    Object.keys(v.channels).forEach(channel => {
      // Create channel object
      if (!o[follow][channel]) { o[follow][channel] = {} }
      // Get outer config
      Object.keys(v).filter(v => !['follows', 'channels'].includes(v)).forEach(key => o[follow][channel][key] = v[key])
      // Get inner config
      Object.keys(v.channels[channel]).forEach(key => o[follow][channel][key] = v.channels[channel][key])
    })
  }))
  return o
}

function transformTwitterProfileSetting(raw) {
  const o = raw
  // Make sure interval exist as number
  Object.keys(o).forEach(v => o[v].interval = Number(o[v].interval))
  return o
}
