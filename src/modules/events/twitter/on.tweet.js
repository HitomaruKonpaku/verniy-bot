module.exports = function (eventEmitter) {
  return function (tweet) {
    eventEmitter.emit('tweet', tweet)
  }
}
