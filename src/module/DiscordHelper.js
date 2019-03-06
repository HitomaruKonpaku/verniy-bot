const Logger = require('./Logger')
const ConfigVar = require('./ConfigVar')
const TwitterClient = require('./TwitterClient')

class DiscordHelper {

  constructor() {
    this.Twitter = {}
    this.Twitter.Tweet = this.transformTwitterTweetSetting(ConfigVar.SETTINGS.Twitter.Tweet)
    this.Twitter.Profile = this.transformTwitterProfileSetting(ConfigVar.SETTINGS.Twitter.Profile)
  }

  runOnReady(client) {
    //
    Logger.log(`DISCORD ${client.user.tag} online!`)
    client.user.setActivity(`Type ${client.commandPrefix}help for help`, { type: 'PLAYING' })
    //
    Logger.log('DISCORD Owners')
    client.owners
      .filter(v => !!v)
      .forEach(v => Logger.log(`- ${v.id} > ${v.tag}`))
    //
    client.registry.commands.filter(v => v.name === 'guild').first().run()
    // Twitter
    if (ConfigVar.TWITTER_ENABLE) {
      if (ConfigVar.TWITTER_PROFILE_ENABLE) {
        const setting = this.Twitter.Profile
        TwitterClient.checkProfiles(setting)
        TwitterClient.on('profile', user => this.onTwitterProfile({ user, setting, discord: client }))
      }
      if (ConfigVar.TWITTER_TWEET_ENABLE) {
        const setting = this.Twitter.Tweet
        const follows = Object.keys(setting)
        TwitterClient.checkTweets(follows)
        TwitterClient.on('tweet', tweet => this.onTwitterTweet({ tweet, setting, discord: client }))
      }
    }
    // Cron
    if (ConfigVar.CRON_ENABLE) {
      const CronKC = require('./CronKC')
      const channels = ConfigVar.SETTINGS.Cron.KanColle
      CronKC.start()
      CronKC.on('message', msg => {
        Logger.log('CRON Message: ' + msg)
        this.sendMessageAsBot({ discord: client, channels, message: msg })
      })
    }
  }

  onReady() {
    Logger.log('DISCORD READY')
  }

  onReconnecting() {
    Logger.log('DISCORD RECONNECTING')
  }

  onDebug(info) {
    const skipMsg = [
      'Authenticated using token',
      'Sending a heartbeat',
      'Heartbeat acknowledged'
    ]
    if (skipMsg.some(v => info.includes(v))) {
      return
    }
    info = info.replace(/\.$/, '')
    Logger.debug(info)
  }

  onWarn(info) {
    info = info.replace(/\.$/, '')
    Logger.warn(info)
  }

  onError(error) {
    Logger.error(error)
  }

  onResume() {
    Logger.log('DISCORD RESUME')
  }

  onDisconnect() {
    Logger.warn('DISCORD DISCONNECT')
  }

  onMessage(msg) {
    // Ingore bot incoming message
    if (msg.author.bot) {
      return
    }
    //
    const content = msg.content
    const uid = msg.author.id
    const gid = (msg.guild || {}).id
    //
    const kowaiMsg = 'Kowai'
    if (content.includes(kowaiMsg) && (
      (uid === '379177718430040066' && gid === '345295036809740289')
      ||
      (uid === '203518448771399680' && gid === '376294828184567810')
    )) {
      msg.channel.send(kowaiMsg)
      return
    }
    //
    const waveMsg = '👋'
    if (content === waveMsg) {
      msg.channel.send(waveMsg)
      return
    }
  }

  onGuildCreate(guild) {
    Logger.log(`DISCORD GUILD JOINED: ${guild.name} at ${new Date().toCustomString()}`)
  }

  onGuildDelete(guild) {
    Logger.log(`DISCORD GUILD LEAVE : ${guild.name} at ${new Date().toCustomString()}`)
  }

  onGuildUnavailable(guild) {
    Logger.log(`DISCORD GUILD UNAVAILABLE: ${guild.name} at ${new Date().toCustomString()}`)
  }

  getRegisterGroups() {
    return [
      ['dev', 'Developer'],
      ['util', 'Utility'],
      ['kc', 'KanColle'],
      ['fun', 'Funny'],
      ['user', 'User'],
      ['guild', 'Guild']
    ]
  }

  transformTwitterTweetSetting(raw) {
    const o = {}
    raw.forEach(v => v.follows.forEach(follow => {
      // Create follow user object
      if (!o[follow]) { o[follow] = {} }
      // Loop channels object
      Object.keys(v.channels).forEach(channel => {
        // Create channel object
        if (!o[follow][channel]) { o[follow][channel] = {} }
        // Get outer config
        Object.keys(v).filter(v => !['follows', 'channels'].includes(v)).forEach(key => o[follow][channel][key] = v[key])
        // Get inner config
        Object.keys(v.channels[channel]).forEach(key => o[follow][channel][key] = v.channels[channel][key])
      })
    }))
    return o
  }

  transformTwitterProfileSetting(raw) {
    const o = raw
    return o
  }

  async onTwitterTweet({ tweet, setting, discord }) {
    // Tweet user
    const uid = tweet.user.id_str
    if (!Object.keys(setting).includes(uid)) {
      return
    }
    // Which channels to send?
    const sendChannels = []
    Object.keys(setting[uid]).forEach(cid => {
      const channel = setting[uid][cid]
      // Check reply
      if (channel.reply !== undefined && channel.reply !== !!tweet.in_reply_to_screen_name) {
        return
      }
      // Check retweet
      if (channel.retweet !== undefined && channel.retweet !== !!tweet.retweeted_status) {
        return
      }
      // Check media
      if (channel.media !== undefined && channel.media !== !!tweet.entities.media) {
        return
      }
      sendChannels.push(cid)
    })
    // Skip
    if (sendChannels.length === 0) { return }
    // Log
    const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
    Logger.log('TWITTER TWEET ' + url)
    // Make message, embed & send
    const message = url
    const embed = this.makeTweetEmbed(tweet)
    this.sendMessageAsBot({ discord, channels: sendChannels, message, embed })
  }

  makeTweetEmbed(tweet) {
    //
    const { RichEmbed } = require('discord.js')
    const he = require('he')
    //
    const embed = new RichEmbed({
      color: parseInt(tweet.user.profile_background_color || '1DA1F2', 16),
      author: {
        name: `${tweet.user.name} (@${tweet.user.screen_name})`,
        url: `https://twitter.com/${tweet.user.screen_name}`,
        icon_url: tweet.user.profile_image_url_https
      },
      timestamp: new Date(),
      footer: {
        text: 'Twitter',
        icon_url: 'http://abs.twimg.com/icons/apple-touch-icon-192x192.png'
      }
    })
    //
    let description = tweet.text
    let media
    //
    try {
      if (tweet.extended_tweet) {
        const ex = tweet.extended_tweet
        if (ex.full_text) {
          description = ex.full_text
        }
        if (ex.entities.media) {
          media = ex.entities.media[0].media_url_https
        }
      } else if (tweet.entities.media) {
        media = tweet.entities.media[0].media_url_https
      }
      if (!media && tweet.quoted_status) {
        const qs = tweet.quoted_status
        if (qs.extended_tweet) {
          const ex = qs.extended_tweet
          media = ex.entities.media[0].media_url_https
        } else if (tweet.quoted_status.entities.media) {
          media = qs.entities.media[0].media_url_https
        }
      }
    } catch (err) {
      Logger.warn(err)
    }
    // Fix special char e.g. '&amp;' to '&'
    description = he.decode(description)
    //
    embed.setDescription(description)
    embed.setImage(media)
    return embed
  }

  async onTwitterProfile({ user, setting, discord }) {
    const imgSrc = user.profile_image_url_https
    if (!imgSrc) return
    const imgFull = imgSrc.replace('_normal', '')
    Logger.log(`TWITTER AVATAR @${user.screen_name} > ${imgFull}`)
    const uid = user.id_str
    const userSetting = setting[uid]
    const channels = userSetting.channels
    const channels2 = userSetting.channelsAsUser
    this.sendMessageAsBot({ discord, channels, message: imgFull })
    this.sendMessageAsUser({ channels: channels2, message: imgFull })
  }

  async sendMessageAsBot({ discord, channels, message, embed }) {
    //
    if ((channels || []).length === 0) return
    //
    discord.channels
      .filter(v => v.type === 'text' && channels.includes(v.id))
      .array()
      .forEach(v => v.send(message, embed)
        .then(() => Logger.log(`DONE > ${v.guild.name} > #${v.name}`))
        .catch(err => {
          const code = err.code
          const message = err.message
          if (code === 50013 || message === 'Missing Permissions') {
            Logger.warn(`Missing Permissions > Send Message > ${v.guild.name} > #${v.name}`)
            return
          }
          if (code || message) {
            Logger.warn(`${code} > ${message}`)
            return
          }
          Logger.warn(err)
        })
      )
  }

  async sendMessageAsUser({ channels, message, embed }) {
    //
    if ((channels || []).length === 0) return
    //
    const token = ConfigVar.DISCORD_TOKEN_USER
    if (!token) return
    //
    const Discord = require('discord.js')
    const discord = new Discord.Client()
    const sendTotal = channels.length
    let sendCount = 0
    //
    discord.on('ready', () => {
      Logger.log(`DISCORD USER ${discord.user.tag} online!`)
      discord.channels
        .filter(v => v.type === 'text' && channels.includes(v.id))
        .array()
        .forEach(v => v.send(message, embed)
          .then(() => Logger.log(`DONE > ${v.guild.name} > #${v.name}`))
          .catch(err => Logger.error(err))
          .then(() => {
            sendCount++
            if (sendCount !== sendTotal) return
            Logger.log('DISCORD USER Disconnecting...')
            discord
              .destroy()
              .then(() => Logger.log('DISCORD USER Disconnected!'))
          })
        )
    })
    //
    Logger.log('DISCORD USER Connecting...')
    discord.login(token)
  }

}

module.exports = new DiscordHelper()
