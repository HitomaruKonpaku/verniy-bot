import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { SpaceV2 } from 'twitter-api-v2'
import { baseLogger } from '../../../../logger'
import { ArrayUtils } from '../../../../utils/array.utils'
import { ConfigService } from '../../../config/services/config.service'
import { DiscordService } from '../../../discord/services/discord.service'
import { TrackTwitterSpace } from '../../../track/models/track-twitter-space.entity'
import { TrackTwitterSpaceService } from '../../../track/services/track-twitter-space.service'
import { TWITTER_API_LIST_SIZE } from '../../constants/twitter.constant'
import { SpaceState } from '../../enums/twitter-space.enum'
import { TwitterSpace } from '../../models/twitter-space.entity'
import { twitterSpacesByFleetsAvatarContentLimiter } from '../../twitter.limiter'
import { TwitterEntityUtils } from '../../utils/twitter-entity.utils'
import { TwitterSpaceUtils } from '../../utils/twitter-space.utils'
import { TwitterUtils } from '../../utils/twitter.utils'
import { TwitterApiPublicService } from '../api/twitter-api-public.service'
import { TwitterApiService } from '../api/twitter-api.service'
import { TwitterSpaceControllerService } from '../controller/twitter-space-controller.service'
import { TwitterUserControllerService } from '../controller/twitter-user-controller.service'
import { TwitterSpaceService } from '../data/twitter-space.service'
import { TwitterUserService } from '../data/twitter-user.service'
import { TwitterTokenService } from '../twitter-token.service'

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
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TwitterSpaceControllerService)
    private readonly twitterSpaceControllerService: TwitterSpaceControllerService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
    @Inject(TwitterApiPublicService)
    private readonly twitterApiPublicService: TwitterApiPublicService,
    @Inject(TwitterTokenService)
    private readonly twitterTokenService: TwitterTokenService,
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
      const userIds = await this.trackTwitterSpaceService.getUserIds()
      if (userIds.length) {
        this.logger.debug('checkNewSpaces', { userCount: userIds.length })
        const chunks = ArrayUtils.splitIntoChunk(userIds, TWITTER_API_LIST_SIZE)
        await Promise.allSettled(chunks.map((v) => this.getSpacesByUserIds(v)))
      }
    } catch (error) {
      this.logger.error(`checkNewSpaces: ${error.message}`)
    }

    const interval = this.newSpacesCheckInterval
    setTimeout(() => this.checkNewSpaces(), interval)

    if (this.twitterTokenService.getAuthToken()) {
      // Use public API to get Spaces
      setTimeout(() => this.checkNewSpacesByPublicApi(), interval / 2)
    }
  }

  private async checkLiveSpaces() {
    try {
      const spaceIds = await this.twitterSpaceService.getLiveSpaceIds()
      if (spaceIds.length) {
        const chunks = ArrayUtils.splitIntoChunk(spaceIds, TWITTER_API_LIST_SIZE)
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
      const users = result.includes?.users || []
      await Promise.allSettled(users.map((v) => this.twitterUserControllerService.saveUserV2(v)))
      await Promise.allSettled(spaces.map((v) => this.updateSpace(v)))
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

  private async checkNewSpacesByPublicApi() {
    try {
      const userIds = await this.trackTwitterSpaceService.getUserIds()
      if (!userIds.length) {
        return
      }
      this.logger.debug('checkNewSpacesByPublicApi', { userCount: userIds.length })
      const spaceIds = await this.getSpaceIdsByUserIdsByPublicApi(userIds)
      if (!spaceIds.length) {
        return
      }
      const chunks = ArrayUtils.splitIntoChunk(spaceIds, TWITTER_API_LIST_SIZE)
      await Promise.allSettled(chunks.map((v) => this.getSpacesByIds(v)))
    } catch (error) {
      this.logger.error(`checkNewSpacesByPublicApi: ${error.message}`)
    }
  }

  private async getSpaceIdsByUserIdsByPublicApi(userIds: string[]): Promise<string[]> {
    if (!userIds?.length) {
      return []
    }
    try {
      const limiter = twitterSpacesByFleetsAvatarContentLimiter
      const chunks = ArrayUtils.splitIntoChunk(userIds, TWITTER_API_LIST_SIZE)
      const result = await Promise.allSettled(chunks.map((v) => limiter.schedule(() => this.twitterApiPublicService.getSpacesByFleetsAvatarContent(v))))
      const spaceIds = result
        .filter((v) => v.status === 'fulfilled')
        .map((v: any) => Object.values(v.value.users))
        .flat()
        .map((v: any) => v?.spaces?.live_content?.audiospace?.broadcast_id)
        .filter((v) => v) || []
      return spaceIds
    } catch (error) {
      this.logger.error(`getSpaceIdsByUserIdsByPublicApi: ${error.message}`)
    }
    return []
  }

  private async updateSpace(space: SpaceV2) {
    try {
      const oldSpace = await this.twitterSpaceService.getOneById(space.id)
      let newSpace = await this.twitterSpaceService.save(TwitterEntityUtils.buildSpace(space))

      if (newSpace.state === SpaceState.LIVE && !oldSpace?.playlistUrl) {
        // Get additional space data
        try {
          await this.twitterSpaceControllerService.saveAudioSpace(newSpace.id)
          newSpace = await this.twitterSpaceService.getOneById(newSpace.id)
        } catch (error) {
          this.logger.error(`updateSpace#saveAudioSpace: ${error.message}`, { id: newSpace.id })
        }
      }

      await this.updateSpaceCreator(newSpace)

      await this.notifySpace(newSpace, oldSpace)

      if (newSpace.state === SpaceState.ENDED) {
        await this.updateUnknownUsers()
      }
    } catch (error) {
      this.logger.error(`updateSpace: ${error.message}`, { space })
    }
  }

  private async updateSpaceCreator(space: TwitterSpace) {
    try {
      if (!space.creatorId) {
        return
      }
      if (await this.twitterUserService.getOneById(space.creatorId)) {
        return
      }
      await this.twitterUserControllerService.getOneById(space.creatorId)
    } catch (error) {
      this.logger.error(`updateSpaceCreator: ${error.message}`, { space })
    }
  }

  private async updateUnknownUsers() {
    try {
      const ids = await this.twitterSpaceService.getUnknownUserIds()
      if (!ids.length) {
        return
      }
      this.logger.log('updateUnknownUsers', { userCount: ids.length })
      const users = await this.twitterApiService.getAllUsersByUserIds(ids)
      await Promise.allSettled(users.map((user) => this.twitterUserControllerService.saveUser(user)))
    } catch (error) {
      this.logger.error(`updateUnknownUsers: ${error.message}`)
    }
  }

  public async notifySpace(newSpace: TwitterSpace, oldSpace?: TwitterSpace) {
    const spaceId = newSpace.id
    try {
      const space = await this.twitterSpaceService.getOneById(
        spaceId,
        { withCreator: true, withHosts: true, withSpeakers: true },
      )

      if (newSpace.state !== oldSpace?.state) {
        await this.notifySpaceStateChanged(space)
        return
      }

      const newUserIds = ArrayUtils.difference(
        TwitterSpaceUtils.getUserIds(newSpace),
        TwitterSpaceUtils.getUserIds(oldSpace),
      )
      if (newUserIds.length) {
        await this.notifySpaceUsersChanged(space, newUserIds)
      }
    } catch (error) {
      this.logger.error(`notifySpace: ${error.message}`, { spaceId })
    }
  }

  private async notifySpaceStateChanged(space: TwitterSpace) {
    this.logger.warn(`notifySpaceStateChanged: ${space.id}`, {
      url: TwitterUtils.getSpaceUrl(space.id),
      creator: space.creator?.username,
      state: space.state,
    })
    const userIds = TwitterSpaceUtils.getUserIds(space)
    const tracks = await this.getTrackItems(space.id, userIds)
    await this.notifySpaceByTracks(space, tracks)
  }

  private async notifySpaceUsersChanged(space: TwitterSpace, userIds: string[]) {
    this.logger.warn(`notifySpaceUsersChanged: ${space.id}`, {
      url: TwitterUtils.getSpaceUrl(space.id),
      creator: space.creator?.username,
      state: space.state,
      userIds,
    })
    const tracks = await this.getTrackItems(space.id, userIds)
    await this.notifySpaceByTracks(space, tracks)
  }

  private async notifySpaceByTracks(space: TwitterSpace, tracks: TrackTwitterSpace[]) {
    if (!tracks?.length) {
      return
    }
    await Promise.allSettled(tracks.map((v) => this.notifySpaceByTrack(space, v)))
  }

  private async notifySpaceByTrack(space: TwitterSpace, track: TrackTwitterSpace) {
    try {
      const content = space.state !== SpaceState.ENDED
        ? track.discordMessage
        : null
      const embed = TwitterSpaceUtils.getEmbed(space, track)
      await this.discordService.sendToChannel(
        track.discordChannelId,
        { content, embeds: [embed] },
      )
    } catch (error) {
      this.logger.error(`notifySpaceByTrack: ${error.message}`, { space, track })
    }
  }

  private async getTrackItems(spaceId: string, userIds: string[]) {
    try {
      const items = await this.trackTwitterSpaceService.getManyByUserIds(userIds)
      return items
    } catch (error) {
      this.logger.error(`getTrackItems: ${error.message}`, { spaceId, userIds })
    }
    return []
  }
}
