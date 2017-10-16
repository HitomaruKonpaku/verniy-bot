const fs = require('fs-extra')
const path = require('path')
const DTM = require('./datetime')

module.exports = {
    console: ({ user, message }) => {
        const now = DTM.DateTime(),
            hr = '----------------------------------------'
        console.log(hr)
        console.log(now)
        if (user) console.log(user)
        if (message) console.log(message)
    },
    file: ({ level, data }) => {
        const keywordFilter = [
            'Authenticated using token',
            '[ws] [connection]'
        ]

        data = data ? data.toString() : ''
        if (keywordFilter.some(v => data.indexOf(v) != -1)) return

        const _date = new Date(),
            date = DTM.Date(_date),
            time = DTM.Time(_date),
            file = path.join(__dirname, `../_log/${date}.txt`),
            msg = [time, level.toUpperCase(), data].join(';;') + '\r'
        fs.ensureFileSync(file)
        fs.appendFile(file, msg).then(() => {})
    },
}