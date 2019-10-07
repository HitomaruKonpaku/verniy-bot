const logger = require('log4js').getLogger('Util')

class TwitterUtil {

  transformTweetConfig(raw) {
    logger.info('Transform TweetConfig')
    logger.debug(raw)
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
    logger.debug(o)
    return o
  }

  transformProfileConfig(raw) {
    logger.info('Transform ProfileConfig')
    logger.debug(raw)
    const o = raw
    // Make sure interval exist as number
    Object.keys(o).forEach(v => o[v].interval = Number(o[v].interval))
    logger.debug(o)
    return o
  }

}

module.exports = new TwitterUtil()
