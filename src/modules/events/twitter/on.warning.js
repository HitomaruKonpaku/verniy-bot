const logger = require('log4js').getLogger('TwitterStream')

module.exports = function (warn) {
  logger.warn(warn)
}
