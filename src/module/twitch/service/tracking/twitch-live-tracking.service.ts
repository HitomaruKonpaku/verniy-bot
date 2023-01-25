import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { ArrayUtil } from '../../../../util/array.util'
import { ConfigService } from '../../../config/service/config.service'
import { DiscordService } from '../../../discord/service/discord.service'
import { TrackTwitchLiveService } from '../../../track/service/track-twitch-live.service'
import { TWITCH_API_LIST_SIZE } from '../../constant/twitch.constant'
import { TwitchStream } from '../../model/twitch-stream.entity'
import { TwitchUtil } from '../../util/twitch.util'
import { TwitchApiService } from '../api/twitch-api.service'
import { TwitchStreamControllerService } from '../controller/twitch-stream-controller.service'
import { TwitchUserControllerService } from '../controller/twitch-user-controller.service'
import { TwitchStreamService } from '../data/twitch-stream.service'
import { TwitchUserService } from '../data/twitch-user.service'

@Injectable()
export class TwitchLiveTrackingService {
  private readonly logger = baseLogger.child({ context: TwitchLiveTrackingService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TrackTwitchLiveService)
    private readonly trackTwitchLiveService: TrackTwitchLiveService,
    @Inject(TwitchUserService)
    private readonly twitchUserService: TwitchUserService,
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
      const userIds = await this.trackTwitchLiveService.getUserIdsForInit()
      if (!userIds.length) {
        return
      }
      const chunks = ArrayUtil.splitIntoChunk(userIds, TWITCH_API_LIST_SIZE)
      await Promise.allSettled(chunks.map((v) => this.twitchUserControllerService.fetchUsersByIds(v)))
    } catch (error) {
      this.logger.error(`initUsers: ${error.message}`)
    }
  }

  private async checkStreams() {
    try {
      const userIds = await this.trackTwitchLiveService.getUserIdsForLiveCheck()
      const chunks = ArrayUtil.splitIntoChunk(userIds, TWITCH_API_LIST_SIZE)
      await Promise.allSettled(chunks.map((v) => this.checkStreamsByUserIds(v)))
    } catch (error) {
      this.logger.error(`checkStreams: ${error.message}`)
    }

    const { interval } = this.configService.twitch.live
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
      newStream.user = await this.twitchUserService.getOneById(newStream.userId)
      if (!oldStream) {
        await this.notifyStream(newStream)
      }
    } catch (error) {
      this.logger.error(`updateStream: ${error.message}`, { stream })
    }
  }

  private async notifyStream(stream: TwitchStream) {
    try {
      this.logger.warn(`notifyStream: ${stream.user.username}`, { url: TwitchUtil.getUserUrl(stream.user.username) })
      const trackItems = await this.getTrackItems(stream)
      if (!trackItems.length) {
        return
      }
      trackItems.forEach((trackItem) => {
        const content = [trackItem.discordMessage]
          .filter((v) => v)
          .join('\n') || null
        this.discordService.sendToChannel(
          trackItem.discordChannelId,
          {
            content,
            embeds: [TwitchUtil.getEmbed(stream)],
          },
        )
      })
    } catch (error) {
      this.logger.error(`notifyStream: ${error.message}`, { stream })
    }
  }

  private async getTrackItems(stream: TwitchStream) {
    try {
      const items = await this.trackTwitchLiveService.getManyByUserId(stream.userId)
      return items
    } catch (error) {
      this.logger.error(`getTrackItems: ${error.message}`, { stream })
    }
    return []
  }
}
