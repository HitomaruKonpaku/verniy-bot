const logger = require('log4js').getLogger('Discord')

module.exports = function(client) {
  return function(tweet) {
    logger.info(client)
    logger.info(tweet)
  }
}
