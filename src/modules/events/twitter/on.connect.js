const logger = require('log4js').getLogger('TwitterStream')

module.exports = function(follows) {
  logger.info('Connecting...')
  logger.info('Checking new tweet of ' + follows.join(', '))
  return function() {
    //
  }
}
