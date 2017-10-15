const fs = require('fs')
const Discord = require('../_data/settings.json').Discord
const dbPath = __dirname + '/../_data/db.json'

let DB = module.exports = {
    getDB: () => {
        return fs.existsSync(dbPath) ? fs.readFileSync(dbPath) : { guilds: {}, users: {} }
    },
    setDB: (data) => {
        fs.writeFileSync(dbPath, JSON.stringify(data))
    },
    getGuildPrefix: (id) => {
        if (!id) return

        let db = DB.getDB(),
            guilds = db.guilds,
            guild = guilds[id],
            save = false

        if (!guild) {
            guild = {}
            guilds[id] = guild
            save = true
        }
        if (!guild.prefix) {
            guild.prefix = Discord.Prefix
            save = true
        }
        if (save) {
            DB.setDB(db)
        }

        return guild.prefix
    },
    setGuildPrefix: (id, prefix) => {
        let db = DB.getDB()
        if (!db.guilds[id]) db.guilds[id] = {}
        if (!db.guilds[id].prefix) db.guilds[id].prefix = Discord.Prefix
        db.guilds[id].prefix = prefix
        DB.setDB(db)
    },
    getUserPrefix: (id) => {
        if (id == undefined) return

        let db = DB.getDB(),
            users = db.users,
            user = users[id],
            save = false

        if (!user) {
            user = {}
            users[id] = user
            save = true
        }
        if (!user.prefix) {
            user.prefix = Discord.Prefix
            save = true
        }
        if (save) {
            DB.setDB(db)
        }

        return user.prefix
    },
    setUserPrefix: (id, prefix) => {
        let db = DB.getDB()
        if (!db.users[id]) db.users[id] = {}
        if (!db.users[id].prefix) db.users[id].prefix = Discord.Prefix
        db.users[id].prefix = prefix
        DB.setDB(db)
    },
}