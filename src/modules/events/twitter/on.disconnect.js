const logger = require('log4js').getLogger('TwitterStream')

module.exports = function (stream) {
  return function (msg) {
    logger.warn('Disconnected: ' + msg)
    stream.start()
  }
}
