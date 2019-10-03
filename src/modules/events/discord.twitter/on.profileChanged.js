const logger = require('log4js').getLogger('Discord')

module.exports = function(client) {
  return function(user) {
    logger.info(client)
    logger.info(user)
  }
}
