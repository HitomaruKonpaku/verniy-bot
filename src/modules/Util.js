const Logger = require('./Logger')

module.exports = {
    broadcastDiscordChannels: (discord, channels, message, embed) => {
        let channelList = getDiscordBroadcastChannel(discord, channels)
        channelList.forEach(v => {
            v.send(message, embed)
                .then(() => Logger.log(`Done: ${v.guild.name} > ${v.name}`))
                .catch(err => Logger.error(err))
        })
    },
    getDiscordCommandWithID: (discord, id) => {
        let cmd = discord.registry.commands
            .filterArray(v => v.name == id)
        return cmd.length != 0 ? cmd[0] : undefined
    },
    getDiscordBroadcastChannel: (discord, channels) => {
        let set = new Set(channels)
        let broadcast = discord.channels
            .filterArray(v =>
                v.type == 'text' &&
                set.has(v.id)
            )
        return broadcast
    },
    getTwitterFollow: data => {
        let list = []
        for (const key in data) {
            list.push(key)
        }
        return list
    },
    getTwitterFollowBroadcast: data => {
        let list = []
        for (const key in data.follower) {
            list.push(key)
        }
        return list
    },
}