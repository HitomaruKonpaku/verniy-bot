const Logger = require('./Logger')

module.exports = {
  load: function () {
    loadDatePrototype()
  }
}

function loadDatePrototype() {
  /**
     * Return date string with format [YYYY-MM-DD hh:mm:ss]
     * @param {*} TimezoneOffset
     */
  Date.prototype.toCustomString = function (TimezoneOffset) {
    if (!TimezoneOffset || isNaN(TimezoneOffset)) {
      TimezoneOffset = this.getTimezoneOffset()
    }
    TimezoneOffset = TimezoneOffset % 24
    const date = new Date(this.getTime() + TimezoneOffset * 3600000)
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
