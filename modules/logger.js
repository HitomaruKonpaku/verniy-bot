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
        if (error.message) {
            printLog(5, error.message)
        } else {
            printLog(5, message)
        }
        console.trace(error)
    },
}