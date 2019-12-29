const logger = require('log4js').getLogger('Discord')

module.exports = function (info) {
  const skipMessages = [
    'Authenticated using token',
    'Sending a heartbeat',
    'Heartbeat acknowledged',
    'READY'
  ]
  if (skipMessages.some(v => info.includes(v))) {
    return
  }
  logger.debug(info)
}
