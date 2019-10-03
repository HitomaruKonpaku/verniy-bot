const logger = require('log4js').getLogger('Discord')
const Util = require('../../Util')

module.exports = function(client, config) {
  return function(tweet) {
    // Tweet's author
    const uid = tweet.user.id_str
    if (!Object.keys(config).includes(uid)) {
      return
    }

    // Which channels to send?
    const sendChannels = []
    Object.keys(config[uid]).forEach(cid => {
      const channel = config[uid][cid]
      // Check reply exist, allow self reply
      if (channel.reply !== undefined) {
        if (channel.reply !== !!tweet.in_reply_to_screen_name && tweet.in_reply_to_screen_name !== tweet.user.screen_name) {
          return
        }
      }
      // Check retweet
      if (channel.retweet !== undefined) {
        if (channel.retweet !== !!tweet.retweeted_status) {
          return
        }
      }
      // Check media
      if (channel.media !== undefined) {
        const media = getTweetMediaObject(tweet)
        if (channel.media !== !!media) {
          return
        }
      }
      sendChannels.push(cid)
    })

    // Send
    const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
    logger.info('Tweet: ' + url)
    const message = url
    Util.sendDiscordMessageAsBot({ client, channels: sendChannels, message })
  }
}

function getTweetMediaObject(tweet) {
  function getRoot(tweet) {
    if (tweet.retweeted_status) {
      return tweet.retweeted_status.extended_tweet || tweet.retweeted_status
    }
    if (tweet.quoted_status) {
      return tweet.quoted_status.extended_tweet || tweet.quoted_status
    }
    return tweet.extended_tweet || tweet
  }
  const root = getRoot(tweet)
  const media = root.entities.media
  return media
}
