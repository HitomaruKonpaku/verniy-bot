import { codeBlock } from '@discordjs/builders'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { SpaceV2 } from 'twitter-api-v2'
import { logger as baseLogger } from '../../../logger'
import { Utils } from '../../../utils/Utils'
import { ConfigService } from '../../config/services/config.service'
import { TwitterSpace } from '../../database/models/twitter-space.entity'
import { TrackTwitterSpaceService } from '../../database/services/track-twitter-space.service'
import { TwitterSpaceService } from '../../database/services/twitter-space.service'
import { DiscordService } from '../../discord/services/discord.service'
import { TWITTER_API_LIST_SIZE } from '../constants/twitter.constant'
import { TwitterEntityUtils } from '../utils/TwitterEntityUtils'
import { TwitterApiPublicService } from './twitter-api-public.service'
import { TwitterApiService } from './twitter-api.service'

@Injectable()
export class TwitterSpaceTrackingService {
  private readonly logger = baseLogger.child({ context: TwitterSpaceTrackingService.name })

  private newSpacesCheckInterval = 60000;
  private liveSpacesCheckInterval = 30000;

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TrackTwitterSpaceService)
    private readonly trackTwitterSpaceService: TrackTwitterSpaceService,
    @Inject(TwitterSpaceService)
    private readonly twitterSpaceService: TwitterSpaceService,
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
    @Inject(TwitterApiPublicService)
    private readonly twitterApiPublicService: TwitterApiPublicService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) {
    this.newSpacesCheckInterval = this.configService.twitter.space.interval
  }

  public async start() {
    this.logger.info('Starting...')
    await this.checkNewSpaces()
    await this.checkLiveSpaces()
  }

  private async checkNewSpaces() {
    try {
      const userIds = await this.trackTwitterSpaceService.getTwitterUserIds()
      if (userIds.length) {
        const chunks = Utils.splitArrayIntoChunk(userIds, TWITTER_API_LIST_SIZE)
        await Promise.allSettled(chunks.map((v) => this.getSpacesByUserIds(v)))
      }
    } catch (error) {
      this.logger.error(`checkNewSpaces: ${error.message}`)
    }

    const interval = this.newSpacesCheckInterval
    setTimeout(() => this.checkNewSpaces(), interval)
  }

  private async checkLiveSpaces() {
    try {
      const spaceIds = await this.twitterSpaceService.getLiveSpaceIds()
      if (spaceIds.length) {
        const chunks = Utils.splitArrayIntoChunk(spaceIds, TWITTER_API_LIST_SIZE)
        await Promise.allSettled(chunks.map((v) => this.getSpacesByIds(v)))
      }
    } catch (error) {
      this.logger.error(`checkLiveSpaces: ${error.message}`)
    }

    const interval = this.liveSpacesCheckInterval
    setTimeout(() => this.checkLiveSpaces(), interval)
  }

  private async getSpacesByIds(ids: string[]) {
    try {
      const result = await this.twitterApiService.getSpacesByIds(ids)
      const spaces = result.data || []
      await Promise.allSettled(spaces.map((space) => this.updateSpace(space)))
    } catch (error) {
      this.logger.error(`getSpacesByIds: ${error.message}`)
    }
  }

  private async getSpacesByUserIds(userIds: string[]) {
    try {
      const result = await this.twitterApiService.getSpacesByCreatorIds(userIds)
      const spaces = result.data || []
      await Promise.allSettled(spaces.map((space) => this.updateSpace(space)))
    } catch (error) {
      this.logger.error(`getSpacesByUserIds: ${error.message}`)
    }
  }

  private async updateSpace(space: SpaceV2) {
    try {
      const newSpace = TwitterEntityUtils.buildSpace(space)
      const oldSpace = await this.twitterSpaceService.getOneById(space.id)
      if (newSpace.state === 'live' && !oldSpace?.playlistUrl) {
        // Try to get Space playlist url if not exist
        try {
          newSpace.playlistUrl = await this.twitterApiPublicService.getSpacePlaylistUrl(space.id)
        } catch (error) {
          this.logger.error(`updateSpace#getSpacePlaylistUrl: ${error.message}`, { space })
        }
      }
      await this.twitterSpaceService.update(newSpace)
      if (newSpace.state === oldSpace?.state) {
        return
      }
      this.notifySpace(newSpace)
    } catch (error) {
      this.logger.error(`updateSpace: ${error.message}`, { space })
    }
  }

  private async notifySpace(space: TwitterSpace) {
    try {
      const channelIds = await this.getDiscordChannelIds(space)
      if (!channelIds.length) {
        return
      }

      // TODO: Update message payload
      const rawSpace = await this.twitterSpaceService.getRawOneById(space.id)
      const content = codeBlock('json', JSON.stringify(rawSpace, null, 2))

      this.logger.info('Channels', { id: channelIds })
      channelIds.forEach((channelId) => {
        this.discordService.sendToChannel(channelId, { content })
      })
    } catch (error) {
      this.logger.error(`notifySpace: ${error.message}`, { space })
    }
  }

  private async getDiscordChannelIds(space: TwitterSpace) {
    let channelIds = []
    try {
      const records = await this.trackTwitterSpaceService.getManyByTwitterUserId(space.creatorId)
      channelIds = records.map((v) => v.discordChannelId)
    } catch (error) {
      this.logger.error(`getDiscordChannelIds: ${error.message}`, { space })
    }
    return channelIds
  }
}
