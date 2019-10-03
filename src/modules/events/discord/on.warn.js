const logger = require('log4js').getLogger('Discord')

module.exports = function(info) {
  logger.warn(info)
}
