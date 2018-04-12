function makeLog(level, message) {
    var o = {
        severity: level,
        text: message,
    }
    return JSON.stringify(o)
}

function printLog(level, data) {
    console.log(makeLog(level, data))
}

module.exports = {
    debug: data => {
        printLog(1, data)
    },
    log: data => {
        printLog(3, data)
    },
    error: error => {
        printLog(5, error.message ? error.message : error)
        console.trace(error)
    },
}