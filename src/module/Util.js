const Logger = require('../module/Logger')

class Util {

  getRandomNumber(min, max) {
    min = Number(min)
    max = Number(max)
    const random = Math.floor(Math.random() * (max - min + 1)) + min
    Logger.log(`RNG > Min ${min} > Max ${max} > Random ${random}`)
    return random
  }

}

module.exports = new Util()
