const logger = require('log4js').getLogger('TwitterStream')

module.exports = function (msg) {
  logger.warn(msg)
}
