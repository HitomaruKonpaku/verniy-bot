import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { ArrayUtils } from '../../../../utils/array.utils'
import { ConfigService } from '../../../config/services/config.service'
import { DiscordService } from '../../../discord/services/discord.service'
import { TrackTwitchStreamService } from '../../../track/services/track-twitch-stream.service'
import { TWITCH_API_LIST_SIZE } from '../../constants/twitch.constant'
import { TwitchStream } from '../../models/twitch-stream.entity'
import { TwitchUtils } from '../../utils/twitch.utils'
import { TwitchApiService } from '../api/twitch-api.service'
import { TwitchStreamControllerService } from '../controller/twitch-stream-controller.service'
import { TwitchUserControllerService } from '../controller/twitch-user-controller.service'
import { TwitchStreamService } from '../data/twitch-stream.service'

@Injectable()
export class TwitchStreamTrackingService {
  private readonly logger = baseLogger.child({ context: TwitchStreamTrackingService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TrackTwitchStreamService)
    private readonly trackTwitchStreamService: TrackTwitchStreamService,
    @Inject(TwitchStreamService)
    private readonly twitchStreamService: TwitchStreamService,
    @Inject(TwitchUserControllerService)
    private readonly twitchUserControllerService: TwitchUserControllerService,
    @Inject(TwitchStreamControllerService)
    private readonly twitchStreamControllerService: TwitchStreamControllerService,
    @Inject(TwitchApiService)
    private readonly twitchApiService: TwitchApiService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    await this.initUsers()
    await this.checkStreams()
  }

  private async initUsers() {
    try {
      const userIds = await this.trackTwitchStreamService.getUserIdsForInitUsers()
      if (!userIds.length) {
        return
      }
      const chunks = ArrayUtils.splitIntoChunk(userIds, TWITCH_API_LIST_SIZE)
      await Promise.allSettled(chunks.map((v) => this.twitchUserControllerService.fetchUsersByIds(v)))
    } catch (error) {
      this.logger.error(`initUsers: ${error.message}`)
    }
  }

  private async checkStreams() {
    try {
      const userIds = await this.trackTwitchStreamService.getUserIdsForStreamCheck()
      const chunks = ArrayUtils.splitIntoChunk(userIds, TWITCH_API_LIST_SIZE)
      await Promise.allSettled(chunks.map((v) => this.checkStreamsByUserIds(v)))
    } catch (error) {
      this.logger.error(`checkStreams: ${error.message}`)
    }

    const { interval } = this.configService.twitch.stream
    setTimeout(() => this.checkStreams(), interval)
  }

  private async checkStreamsByUserIds(userIds: string[]) {
    try {
      const { data: streams } = await this.twitchApiService.getStreamsByUserIds(userIds)
      if (!streams?.length) {
        return
      }
      await Promise.allSettled(streams.map((v) => this.updateStream(v)))
    } catch (error) {
      this.logger.error(`checkStreamsByUserIds: ${error.message}`)
    }
  }

  private async updateStream(stream: any) {
    try {
      const oldStream = await this.twitchStreamService.getOneById(stream.id)
      const newStream = await this.twitchStreamControllerService.saveStream(stream)
      if (!oldStream) {
        await this.notifyStream(newStream.id)
      }
    } catch (error) {
      this.logger.error(`updateStream: ${error.message}`, { stream })
    }
  }

  private async notifyStream(streamId: string) {
    try {
      const stream = await this.twitchStreamService.getOneById(streamId, { withUser: true })
      this.logger.warn(`notifyStream: ${stream.user.username}`, { url: TwitchUtils.getUserUrl(stream.user.username) })
      const trackItems = await this.getTrackItems(stream)
      if (!trackItems.length) {
        return
      }
      trackItems.forEach((trackItem) => {
        const content = [trackItem.discordMessage, TwitchUtils.getUserUrl(stream.user.username)]
          .filter((v) => v)
          .join('\n') || null
        this.discordService.sendToChannel(
          trackItem.discordChannelId,
          { content },
        )
      })
    } catch (error) {
      this.logger.error(`notifyStream: ${error.message}`, { streamId })
    }
  }

  private async getTrackItems(stream: TwitchStream) {
    try {
      const items = await this.trackTwitchStreamService.getManyByTwitchUserId(stream.userId)
      return items
    } catch (error) {
      this.logger.error(`getTrackItems: ${error.message}`, { stream })
    }
    return []
  }
}
