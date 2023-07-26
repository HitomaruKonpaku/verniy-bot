import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { ArrayUtil } from '../../../../util/array.util'
import { ConfigService } from '../../../config/service/config.service'
import { DiscordService } from '../../../discord/service/discord.service'
import { TrackTwitterSpace } from '../../../track/model/track-twitter-space.entity'
import { TrackTwitterSpaceService } from '../../../track/service/track-twitter-space.service'
import { TWITTER_API_LIST_SIZE } from '../../constant/twitter.constant'
import { SpaceState } from '../../enum/twitter-space.enum'
import { AvatarContent } from '../../interface/twitter-fleet.interface'
import { TwitterSpace } from '../../model/twitter-space.entity'
import { twitterSpacesByFleetsAvatarContentLimiter } from '../../twitter.limiter'
import { TwitterSpaceUtil } from '../../util/twitter-space.util'
import { TwitterUtil } from '../../util/twitter.util'
import { TwitterGraphqlSpaceService } from '../api/twitter-graphql-space.service'
import { TwitterSpaceControllerService } from '../controller/twitter-space-controller.service'
import { TwitterUserControllerService } from '../controller/twitter-user-controller.service'
import { TwitterSpaceService } from '../data/twitter-space.service'

@Injectable()
export class TwitterSpaceTrackingService {
  private readonly logger = baseLogger.child({ context: TwitterSpaceTrackingService.name })

  private liveSpacesCheckInterval = 60000
  private newSpacesCheckInterval = 60000
  private newSpacesFleetlineCheckInterval = 60000

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TrackTwitterSpaceService)
    private readonly trackTwitterSpaceService: TrackTwitterSpaceService,
    @Inject(TwitterSpaceService)
    private readonly twitterSpaceService: TwitterSpaceService,
    @Inject(TwitterSpaceControllerService)
    private readonly twitterSpaceControllerService: TwitterSpaceControllerService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
    @Inject(TwitterGraphqlSpaceService)
    private readonly twitterGraphqlSpaceService: TwitterGraphqlSpaceService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) {
    this.newSpacesCheckInterval = this.configService.twitter?.space?.interval || this.newSpacesCheckInterval
  }

  public async start() {
    this.logger.info('Starting...')
    await this.checkNewSpacesByFleetline()
    await this.checkNewSpacesByAvatarContent()
    await this.checkLiveSpaces()
  }

  // #region Checkers

  /**
   * Get & update all current live Spaces
   */
  private async checkLiveSpaces() {
    try {
      const spaceIds = await this.twitterSpaceService.getLiveSpaceIds()
      if (spaceIds.length) {
        this.logger.debug('checkLiveSpaces', { count: spaceIds.length, ids: spaceIds })
        // const chunks = ArrayUtil.splitIntoChunk(spaceIds, TWITTER_API_LIST_SIZE)
        // await Promise.allSettled(chunks.map((v) => this.getSpacesByIds(v)))
        await Promise.allSettled(spaceIds.map((id) => this.getSpaceById(id)))
      }
    } catch (error) {
      this.logger.error(`checkLiveSpaces: ${error.message}`)
    }

    const interval = this.liveSpacesCheckInterval
    setTimeout(() => this.checkLiveSpaces(), interval)
  }

  private async checkNewSpacesByAvatarContent() {
    if (!process.env.TWITTER_AUTH_TOKEN) {
      return
    }

    try {
      const userIds = await this.trackTwitterSpaceService.getUserIds()
      if (userIds.length) {
        this.logger.debug('checkNewSpacesByAvatarContent', { userCount: userIds.length })
        const spaceIds = await this.getSpacesByAvatarContent(userIds)
        this.logger.debug('checkNewSpacesByAvatarContent', { count: spaceIds.length, ids: spaceIds })
        await this.getNewSpaces(spaceIds)
      }
    } catch (error) {
      this.logger.error(`checkNewSpacesByAvatarContent: ${error.message}`)
    }

    const interval = this.newSpacesCheckInterval
    setTimeout(() => this.checkNewSpacesByAvatarContent(), interval)
  }

  private async checkNewSpacesByFleetline() {
    if (!process.env.TWITTER_AUTH_TOKEN) {
      return
    }

    try {
      const spaceIds = await this.getSpacesByFleetline()
      this.logger.debug('checkNewSpacesByFleetline', { count: spaceIds.length, ids: spaceIds })
      await this.getNewSpaces(spaceIds)
    } catch (error) {
      this.logger.error(`checkNewSpacesByFleetline: ${error.message}`)
    }

    const interval = this.newSpacesFleetlineCheckInterval
    setTimeout(() => this.checkNewSpacesByFleetline(), interval)
  }

  // #endregion

  // #region Get

  private async getNewSpaces(curSpaceIds: string[]) {
    if (!curSpaceIds?.length) {
      return
    }

    this.logger.debug('getNewSpaces', { count: curSpaceIds.length, ids: curSpaceIds })
    const spaces = await this.twitterSpaceService.getManyByIds(curSpaceIds)
    const newSpaceIds = curSpaceIds.filter((id) => !spaces.some((space) => space.id === id))
    if (!newSpaceIds?.length) {
      return
    }

    this.logger.info('getNewSpaces', { count: newSpaceIds.length, ids: newSpaceIds })
    await Promise.allSettled(newSpaceIds.map((id) => this.getSpaceById(id)))
  }

  private async getSpaceById(id: string) {
    try {
      const oldSpace = await this.twitterSpaceService.getOneById(id)
      const newSpace = await this.twitterSpaceControllerService.getOneById(id)
      const userIds = ArrayUtil.difference(
        [newSpace.hostIds, newSpace.speakerIds].flat(),
        [oldSpace?.hostIds || [], oldSpace?.speakerIds || []].flat(),
      )

      await Promise.allSettled(userIds.map((v) => this.twitterUserControllerService.getUserByRestId(v)))
      await this.notifySpace(newSpace, oldSpace)

      if (newSpace.state === SpaceState.ENDED) {
        await this.saveUnknownParticipants()
      }
    } catch (error) {
      this.logger.error(`getSpaceById: ${error.message}`, { id })
    }
  }

  private async getSpacesByAvatarContent(userIds: string[]): Promise<string[]> {
    if (!userIds?.length) {
      return []
    }
    try {
      const limiter = twitterSpacesByFleetsAvatarContentLimiter
      const chunks = ArrayUtil.splitIntoChunk(userIds, TWITTER_API_LIST_SIZE)
      const result = await Promise.allSettled(chunks.map((v) => limiter.schedule(() => this.twitterGraphqlSpaceService.getSpacesByFleetsAvatarContent(v))))
      const spaceIds = result
        .filter((v) => v.status === 'fulfilled')
        .map((v: PromiseFulfilledResult<AvatarContent>) => Object.values(v.value.users))
        .flat()
        .map((v) => v?.spaces?.live_content?.audiospace?.broadcast_id)
        .filter((v) => v) || []
      return spaceIds
    } catch (error) {
      this.logger.error(`getSpacesByAvatarContent: ${error.message}`)
    }
    return []
  }

  private async getSpacesByFleetline() {
    try {
      const result = await this.twitterGraphqlSpaceService.getSpacesByFleetsFleetline()
      const spaceIds = result.threads
        .map((v) => v.live_content?.audiospace?.broadcast_id)
        .filter((v) => v) || []
      return spaceIds
    } catch (error) {
      this.logger.error(`getSpacesByFleetline: ${error.message}`)
    }
    return []
  }

  // #endregion

  // #region Update

  private async saveUnknownParticipants() {
    try {
      await this.twitterSpaceControllerService.saveUnknownParticipants()
    } catch (error) {
      this.logger.error(`saveUnknownParticipants: ${error.message}`)
    }
  }

  // #endregion

  // #region Notification

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

      const newUserIds = ArrayUtil.difference(
        TwitterSpaceUtil.getUserIds(newSpace),
        TwitterSpaceUtil.getUserIds(oldSpace),
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
      url: TwitterUtil.getSpaceUrl(space.id),
      creator: space.creator?.username,
      state: space.state,
    })
    const userIds = TwitterSpaceUtil.getUserIds(space)
    const tracks = await this.getTrackItems(space.id, userIds)
    await this.notifySpaceByTracks(space, tracks)
  }

  private async notifySpaceUsersChanged(space: TwitterSpace, userIds: string[]) {
    this.logger.warn(`notifySpaceUsersChanged: ${space.id}`, {
      url: TwitterUtil.getSpaceUrl(space.id),
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
      const embed = TwitterSpaceUtil.getEmbed(space, track)
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

  // #endregion
}
