const Logger = require('./Logger')

class TwitterHelper {

  onDisconnect(msg, stream) {
    Logger.warn('TWITTER STREAM DISCONNECT ' + msg)
    stream.start()
  }

  onError(err) {
    Logger.warn('TWITTER STREAM ERROR')
    Logger.error(err)
  }

  onConnected(res) {
    Logger.log('TWITTER STREAM CONNECTED')
  }

  onReconnect(req, res, interval) {
    Logger.log('TWITTER STREAM RECONNECT after ' + interval + 'ms')
  }

  onWarning(warn) {
    Logger.warn('TWITTER STREAM WARN ' + warn)
  }

  onLimit(msg) {
    Logger.warn('TWITTER STREAM LIMIT ' + msg)
  }

}

module.exports = new TwitterHelper()
