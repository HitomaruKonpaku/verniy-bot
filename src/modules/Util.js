module.exports = {
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