module.exports = {
    log: (message, user) => {
        let seperator = '--------------------------------------------------'
        console.log(seperator)
        console.log(new Date().toISOString().replace(/[TZ]/g, ' ').split('.')[0])
        if (user) console.log(user)
        if (message) console.log(message)
    }
}