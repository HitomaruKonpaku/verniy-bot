const { RichEmbed } = require('discord.js')
const Commando = require('discord.js-commando')
const path = require('path')
const he = require('he')
const Settings = require('../settings')
const Logger = require('./Logger')
const TwitterClient = require('./TwitterClient')
const Cron = require('./Cron')
const Util = require('./Util')

const localeCode = Settings.Global.LocaleCode
const dateOptions = Settings.Global.DateOptions

class DiscordClient {
    constructor() {
        Logger.log('DiscordClient constructor')
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
            console.log('Missing token')
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
                if (content == wave) {
                    msg.channel.send(wave)
                }
            })
            .on('guildCreate', guild => {
                Logger.log(`GUILD JOINED: ${guild.name} at ${Intl
                    .DateTimeFormat(localeCode, dateOptions)
                    .format(guild.joinedAt)}`)
            })
            .on('guildDelete', guild => {
                Logger.log(`GUILD LEAVE : ${guild.name} at ${Intl
                    .DateTimeFormat(localeCode, dateOptions)
                    .format(Date.now())}`)
            })
            .on('guildUnavailable', guild => {
                Logger.log(`GUILD UNAVAILABLE: ${guild.name} at ${Intl
                    .DateTimeFormat(localeCode, dateOptions)
                    .format(Date.now())}`)
            })

        // Client registries
        this.client.registry
            .registerDefaultTypes()
            .registerGroups([
                ['dev', 'Developer'],
                ['util', 'Utility'],
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
        Logger.log(`${this.client.user.tag} READY!!!`)
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
        if (this.startSubModule === true) {
            return
        }
        this.startSubModule = true
        //
        this.startTwitter()
        this.startCron()
    }
    sendToChannels({ discord, channels, message, embed }) {
        if (discord === undefined) {
            discord = this.client
        }
        if (channels === undefined) {
            channels = []
        }
        const channelSet = new Set(channels)
        discord.channels
            .filterArray(v => v.type == 'text' && channelSet.has(v.id))
            .forEach(v => v
                .send(message, embed)
                .then(() => console.log(`DONE > ${v.guild.name} > ${v.name}`)))
    }
    startTwitter() {
        const twitterEnable = process.env.TWITTER_ENABLE
        if (!(twitterEnable === 'true' || twitterEnable === '1')) return
        const twitter = new TwitterClient()
        //
        const newTweetData = Settings.Twitter.NewTweet
        const newTweetFollowList = Object.keys(newTweetData)
        const newTweetFollowSet = new Set(newTweetFollowList)
        // twitter.checkTweet(newTweetFollowList)
        //
        const newAvatarData = Settings.Twitter.NewAva
        twitter.checkAvatar(newAvatarData)
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
                const uid = user.id_str
                const channels = Object.keys(newTweetData[uid].channels)
                this.sendAvatar(channels, user)
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
            description = description.replace(/(https{0,1}:\/\/t\.co\/\w+)$/, '').trim()
            // Fix special char e.g. '&amp;' to '&'
            description = he.decode(description)

            embed.setDescription(description)
            embed.setImage(media)
            return embed
        }
        const message = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
        const embed = createEmbed(tweet)
        this.sendToChannels({ channels, message, embed })
    }
    sendAvatar(channels, user) {
        const img = user.profile_image_url_https.replace('_normal', '')
        this.sendToChannels({ channels, message: img })
    }
    startCron() {
        // Cron.start(this.client)
    }
}

module.exports = DiscordClient