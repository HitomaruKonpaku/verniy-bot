import EventEmitter from 'events'
import Twit from 'twit'
import { logger as baseLogger } from '../../../logger'
import { TwitterUserService } from '../../database/services/twitter-user.service'

export class TwitterTweetWatcher extends EventEmitter {
  private readonly logger = baseLogger.child({ context: TwitterTweetWatcher.name })

  private stream: Twit.Stream

  constructor(
    private readonly twit: Twit,
    private readonly twitterUserService: TwitterUserService,
  ) {
    super()
  }

  public async start() {
    const users = await this.twitterUserService.getManyForTweet()
    if (!users?.length) {
      return
    }

    this.logger.info('Starting...')
    this.logger.info('Users', {
      count: users.length,
      usernames: users.map((v) => v.username.toLowerCase()),
    })
    const userIds = users.map((v) => v.id)
    this.initStream(userIds)
  }

  public stop() {
    this.logger.info('Stop')
    this.stream.removeAllListeners()
    this.stream.stop()
  }

  private initStream(userIds: string[]) {
    const streamPath = 'statuses/filter'
    const streamParams = { follow: userIds.join(',') }
    const stream = this.twit.stream(streamPath, streamParams)
    this.stream = stream

    stream.on('error', (error) => this.logger.error(error.message))
    stream.on('warning', (message) => this.logger.warn(`Warning: ${message}`))
    stream.on('limit', (message) => this.logger.warn(`Limit: ${message}`))
    stream.on('connect', () => this.logger.info('Connecting...'))
    stream.on('connected', () => this.logger.info('Connected!'))
    stream.on('disconnect', (message) => this.logger.warn(`Disconnect: ${message}`))
    stream.on('reconnect', (req, res, connectInterval) => this.logger.info(`Reconnect in ${connectInterval}ms`))
    stream.on('tweet', (tweet) => this.emit('tweet', tweet))
  }
}
