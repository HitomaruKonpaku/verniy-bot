const logger = require('log4js').getLogger('TwitterStream')

module.exports = function (req, res, interval) {
  logger.info(`Reconnect after ${interval}ms`)
}
