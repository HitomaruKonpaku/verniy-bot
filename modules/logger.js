function makeLog(level, data) {
    var obj = {
        // time: new Date().toISOString(),
        severity: level.trim().toLowerCase(),
        data,
    }
    return JSON.stringify(obj)
}

function printLog(level, data) {
    console.log(makeLog(level, data))
}

module.exports = {
    custom: (level, data) => {
        printLog(level, data)
    },
    log: data => {
        printLog('log', data)
    },
    debug: data => {
        printLog('debug', data)
    },
    error: error => {
        if (error.message) {
            printLog('error', error.message)
        }
        console.error(error)
    },
}