const { RichEmbed } = require('discord.js')
const Commando = require('discord.js-commando')
const path = require('path')
const he = require('he')
const Settings = require('../settings')
const Logger = require('./Logger')
const TwitterClient = require('./TwitterClient')
const CronKC = require('./CronKC')
const Util = require('./Util')

class DiscordClient {
    constructor() {
        Logger.log('DISCORD constructor')
        // Get variables for client
        this.startSubModule = false
        this.token = process.env.DISCORD_TOKEN_BOT
        this.owner = process.env.DISCORD_OWNER ? process.env.DISCORD_OWNER.split(',') : ['153363129915539457']
        this.commandPrefix = process.env.DISCORD_PREFIX || '.'
        this.commandEditableDuration = 20
        this.nonCommandEditable = false
        this.unknownCommandResponse = false
        //
        if (this.token === undefined) {
            Logger.warn('DISCORD Missing token')
            return
        }
        // Init client
        this.client = new Commando.Client({
            owner: this.owner,
            commandPrefix: this.commandPrefix,
            commandEditableDuration: this.commandEditableDuration,
            nonCommandEditable: this.nonCommandEditable,
            unknownCommandResponse: this.unknownCommandResponse,
        })
        // Client events
        this.client
            // Emitted when the client becomes ready to start working
            .on('ready', () => {
                this.runOnReady()
            })
            // Emitted whenever the client tries to reconnect to the WebSocket
            .on('reconnecting', () => {
                Logger.log('RECONNECTING')
            })
            // Emitted for general debugging information
            .on('debug', info => {
                // Skip
                if ([
                    'Authenticated using token',
                    'Sending a heartbeat',
                    'Heartbeat acknowledged',
                ].some(v => info.indexOf(v) != -1)) {
                    return
                }
                // Format
                info = info.replace(/\.$/, '')
                Logger.debug(info)
            })
            // Emitted for general warnings
            .on('warn', info => {
                info = info.replace(/\.$/, '')
                Logger.warn(info)
            })
            // Emitted whenever the client's WebSocket encounters a connection error
            .on('error', error => {
                Logger.error(error)
            })
            // Emitted whenever a WebSocket resumes
            .on('resume', () => {
                Logger.log('RESUME')
            })
            // Emitted when the client's WebSocket disconnects and will no longer attempt to reconnect
            .on('disconnect', () => {
                Logger.warn('DISCONNECT')
            })
            // Emitted whenever a message is created
            .on('message', msg => {
                // Ingore bot incoming message
                if (msg.author.bot) {
                    return
                }

                // Autism
                const content = msg.content
                const wave = '👋'
                if (content === wave) {
                    msg.channel.send(wave)
                }
            })
            .on('guildCreate', guild => {
                Logger.log(`GUILD JOINED: ${guild.name} at ${new Date().toCustomString(Settings.Global.TimezoneOffset)}`)
            })
            .on('guildDelete', guild => {
                Logger.log(`GUILD LEAVE : ${guild.name} at ${new Date().toCustomString(Settings.Global.TimezoneOffset)}`)
            })
            .on('guildUnavailable', guild => {
                Logger.log(`GUILD UNAVAILABLE: ${guild.name} at ${new Date().toCustomString(Settings.Global.TimezoneOffset)}`)
            })

        // Client registries
        this.client.registry
            .registerDefaultTypes()
            .registerGroups([
                ['dev', 'Developer'],
                ['util', 'Utility'],
                ['user', 'User'],
                ['guild', 'Guild'],
                ['kc', 'KanColle'],
                ['fun', 'Funny'],
            ])
            .registerCommandsIn(path.join(__dirname, '..', 'commands'))
    }
    start() {
        this.client
            .login(this.token)
            .catch(err => Logger.error(err.message))
    }
    runOnReady() {
        //
        Logger.log(`DISCORD ${this.client.user.tag} READY!!!`)
        this.client.user.setActivity(`Type ${this.commandPrefix}help for help`, { type: 'PLAYING' })
        //
        Logger.log('Owners')
        this.client.owners
            .filter(v => v !== undefined)
            .forEach(v => {
                Logger.log(`- ${v.id} > ${v.tag}`)
            })
        //
        const cmd = Util.getDiscordCommandWithID(this.client, 'guild')
        if (cmd) {
            cmd.run()
        }
        //
        if (this.startSubModule === true) return
        this.startSubModule = true
        //
        this.startTwitter()
        this.startCron()
    }
    sendToChannels({ discord, channels, message, embed }) {
        discord = discord || this.client
        channels = channels || []
        const channelSet = new Set(channels)
        discord.channels
            .filterArray(v => v.type === 'text' && channelSet.has(v.id))
            .forEach(v => v
                .send(message, embed)
                .then(() => Logger.log(`DONE > ${v.guild.name} > ${v.name}`))
                .catch(err => console.log(err.message ? err.message : err))
            )
    }
    startTwitter() {
        const isEnable = process.env.TWITTER_ENABLE
        if (!(isEnable === '1' || isEnable === 'true')) return

        const twitter = new TwitterClient()
        //
        const newAvatarData = Settings.Twitter.NewAva
        twitter.checkAvatar(newAvatarData)
        //
        const newTweetData = Settings.Twitter.NewTweet
        const newTweetFollowList = Object.keys(newTweetData)
        const newTweetFollowSet = new Set(newTweetFollowList)
        twitter.checkTweet(newTweetFollowList)
        //
        twitter
            .on('tweet', tweet => {
                const uid = tweet.user.id_str
                // Check tweet source user
                if (!newTweetFollowSet.has(uid)) {
                    return
                }
                // Check retweeted
                if (tweet.retweeted_status) {
                    return
                }
                const channels = Object.keys(newTweetData[uid].channels)
                this.sendTweet(channels, tweet)
            })
            .on('avatar', user => {
                const imgSrc = user.profile_image_url_https
                if (!imgSrc) return
                const imgFull = imgSrc.replace('_normal', '')
                Logger.log(`TWITTER AVATAR @${user.screen_name} > ${imgFull}`)
                const uid = user.id_str
                const channels = newAvatarData[uid].channels
                this.sendAvatar(channels, imgFull)
                const channels2 = newAvatarData[uid].channelsAsUser
                this.sendAvatarAsUser(channels2, imgFull)
            })
    }
    sendTweet(channels, tweet) {
        const createEmbed = tweet => {
            let embed = new RichEmbed({
                color: 0x1da1f2,
                author: {
                    name: `${tweet.user.name} (@${tweet.user.screen_name})`,
                    url: `https://twitter.com/${tweet.user.screen_name}`,
                    icon_url: tweet.user.profile_image_url_https,
                },
                footer: {
                    text: 'Twitter',
                    icon_url: 'http://abs.twimg.com/icons/apple-touch-icon-192x192.png',
                },
            })

            let description = tweet.text
            let media
            if (tweet.extended_tweet) {
                if (tweet.extended_tweet.full_text) {
                    description = tweet.extended_tweet.full_text
                }
                if (tweet.extended_tweet.entities.media) {
                    media = tweet.extended_tweet.entities.media[0].media_url_https
                }
            } else if (tweet.entities.media) {
                media = tweet.entities.media[0].media_url_https
            }

            // Clear shortened link at the end of tweet
            const isUrlOnly = /^(https{0,1}:\/\/t\.co\/\w+)$/.test(description.trim())
            if (!isUrlOnly) description = description.replace(/(https{0,1}:\/\/t\.co\/\w+)$/, '').trim()
            // Fix special char e.g. '&amp;' to '&'
            description = he.decode(description)

            embed.setDescription(description)
            embed.setImage(media)
            return embed
        }
        const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
        const message = url
        const embed = createEmbed(tweet)
        Logger.log(`TWITTER TWEET ${url}`)
        this.sendToChannels({ channels, message, embed })
    }
    sendAvatar(channels, img) {
        this.sendToChannels({ channels, message: img })
    }
    sendAvatarAsUser(channels, img) {
        if ((channels || []).length === 0) return
        const token = process.env.DISCORD_TOKEN_USER
        if (token === undefined) return
        const Discord = require('discord.js')
        const client = new Discord.Client()
        const channelSet = new Set(channels)
        const total = channels.length
        let done = 0
        client.on('ready', () => {
            Logger.log(`DISCORD ${client.user.tag} READY!!!`)
            client.channels.filterArray(v => v.type === 'text' && channelSet.has(v.id))
                .forEach(v => v
                    .send(img)
                    .then(() => Logger.log(`DONE > ${v.guild.name} > ${v.name}`))
                    .catch(err => Logger.error(err))
                    .then(() => {
                        done++
                        if (done !== total) return
                        Logger.log('DISCORD Disconnecting as user!')
                        client
                            .destroy()
                            .then(() => Logger.log('DISCORD Disconnected!'))
                    })
                )
        })
        Logger.log('DISCORD Connecting as user!')
        client.login(token)
    }
    startCron() {
        const isEnable = process.env.CRON_ENABLE
        if (!(isEnable === '1' || isEnable === 'true')) return

        Logger.log('CRON Starting...')
        const cron = new CronKC()
        cron.on('message', msg => {
            Logger.log(`CRON Message: ${msg}`)
            const channels = Settings.Cron.KanColle
            this.sendToChannels({ channels, message: msg })
        })
        cron.start()
    }
}

module.exports = DiscordClient