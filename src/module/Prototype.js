const Logger = require('./Logger')
const ConfigVar = require('./ConfigVar')

class Prototype {

  constructor() {
    Logger.log('PROTOTYPE constructor')
    loadDatePrototype()
  }

}

module.exports = new Prototype()

function loadDatePrototype() {

  /**
   * Return date string with format [YYYY-MM-DD hh:mm:ss]
   * @param {*} timezoneOffset
   */
  Date.prototype.toCustomString = function (timezoneOffset) {
    const offset = (Number(timezoneOffset || ConfigVar.SETTINGS.Global.TimezoneOffset) || this.getTimezoneOffset()) % 24
    const date = new Date(this.getTime() + offset * 3600000)
    const za = [
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate()
    ]
    const zb = [
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    ]
    const zc = [
      za.map(v => String(v).padStart(2, 0)).join('-'),
      zb.map(v => String(v).padStart(2, 0)).join(':')
    ]
    const zd = zc.join(' ')
    return zd
  }
  Logger.log('PROTOTYPE Date.toCustomString()')

}
