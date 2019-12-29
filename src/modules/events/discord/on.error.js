const logger = require('log4js').getLogger('Discord')

module.exports = function (error) {
  logger.error(error)
}
