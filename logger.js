module.exports = {
    log: message => {
        let seperator = '--------------------------------------------------'
        console.log(seperator)
        console.log(new Date().toISOString().replace(/[TZ]/g, ' ').split('.')[0])
        if (message) console.log(message)
    }
}