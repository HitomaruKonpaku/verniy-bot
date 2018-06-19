module.exports = {
    load: function () {
        loadDatePrototype()
    },
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
        const a = [
            date.getUTCFullYear(),
            date.getUTCMonth() + 1,
            date.getUTCDate(),
        ]
        const b = [
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds(),
        ]
        const c = [
            a.map(v => String(v).padStart(2, 0)).join('-'),
            b.map(v => String(v).padStart(2, 0)).join(':'),
        ]
        return c.join(' ')
    }
}