const Logger = require('./Logger')

function broadcastDiscordChannels(discord, channels, message, embed) {
    let channelList = getDiscordBroadcastChannel(discord, channels)
    channelList.forEach(v => {
        v.send(message, embed)
            .then(() => Logger.log(`DONE ${v.guild.name} > ${v.name}`))
            .catch(err => Logger.error(err))
    })
}

function getDiscordBroadcastChannel(discord, channels) {
    let set = new Set(channels)
    let broadcast = discord.channels
        .filterArray(v =>
            v.type == 'text' &&
            set.has(v.id)
        )
    return broadcast
}

function getDiscordCommandWithID(discord, id) {
    let cmd = discord.registry.commands
        .filterArray(v => v.name == id)
    return cmd.length != 0 ? cmd[0] : undefined
}

function getTwitterFollow(data) {
    let list = []
    for (const key in data) {
        list.push(key)
    }
    return list
}

function getTwitterFollowBroadcast(data) {
    let list = []
    for (const key in data.channels) {
        list.push(key)
    }
    return list
}

function getRandomNumber(min, max) {
    min = Number(min)
    max = Number(max)
    let random = Math.floor(Math.random() * (max - min + 1)) + min
    Logger.log(`RNG > Min ${min} > Max ${max} > Random ${random}`)
    return random
}

module.exports = {
    broadcastDiscordChannels: (discord, channels, message, embed) => broadcastDiscordChannels(discord, channels, message, embed),
    getDiscordBroadcastChannel: (discord, channels) => getDiscordBroadcastChannel(discord, channels),
    getDiscordCommandWithID: (discord, id) => getDiscordCommandWithID(discord, id),
    getTwitterFollow: (data) => getTwitterFollow(data),
    getTwitterFollowBroadcast: (data) => getTwitterFollowBroadcast(data),
    getRandomNumber: (min, max) => getRandomNumber(min, max),
}