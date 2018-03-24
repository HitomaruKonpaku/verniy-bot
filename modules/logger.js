function makeLog(level, data) {
    var obj = {
        // time: new Date().toISOString(),
        level: level.trim().toLowerCase(),
        data,
    }
    return JSON.stringify(obj)
}

function printLog(level, data) {
    console.log(makeLog(level, data))
}

module.exports = {
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