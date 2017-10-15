const fs = require('fs')
const path = require('path')
const { stripIndents } = require('common-tags')

module.exports = {
    log: (message, user) => {
        let time = new Date().toISOString().replace(/[TZ]/g, ' ').split('.')[0],
            sep = '--------------------------------------------------'
        console.log(sep)
        console.log(time)
        if (user) console.log(user)
        if (message) console.log(message)
    },
    infoLog: (level, data) => {
        let time = new Date().toISOString().replace(/[TZ]/g, ' ').split('.')[0].split(' '),
            location = path.join(__dirname, '../', '_log', `${time[0]}.txt`),
            sep = '----------'
        level = level.padEnd(5, ' ')
        data = data ? data : ''
        if (fs.existsSync()) fs.appendFileSync(location)
        fs.appendFile(location, `${time[1]} - ${level} - ${data.toString()}` + '\n', err => {})
    },
}