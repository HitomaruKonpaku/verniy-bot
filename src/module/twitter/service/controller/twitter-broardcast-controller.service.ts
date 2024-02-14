import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { baseLogger } from '../../../../logger'
import { TwitterApi } from '../../api/twitter.api'
import { TwitterBroadcast } from '../../model/twitter-broadcast.entity'
import { TwitterEntityUtil } from '../../util/twitter-entity.util'
import { TwitterGraphqlSpaceService } from '../api/twitter-graphql-space.service'
import { TwitterBroadcastService } from '../data/twitter-broadcast.service'
import { TwitterUserControllerService } from './twitter-user-controller.service'

@Injectable()
export class TwitterBroadcastControllerService {
  private readonly logger = baseLogger.child({ context: TwitterBroadcastControllerService.name })

  constructor(
    @Inject(TwitterBroadcastService)
    private readonly twitterBroadcastService: TwitterBroadcastService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
    @Inject(TwitterApi)
    private readonly twitterApi: TwitterApi,
    @Inject(TwitterGraphqlSpaceService)
    private readonly twitterGraphqlSpaceService: TwitterGraphqlSpaceService,
  ) { }

  public async getOneById(id: string, options?: { refresh?: boolean }) {
    let broadcast: TwitterBroadcast
    if (!options?.refresh) {
      broadcast = await this.twitterBroadcastService.getOneById(id)
    }
    if (!broadcast) {
      const data = await this.fetchByIds([id])
      broadcast = data.find((v) => v.id === id)
    }
    return broadcast
  }

  public async fetchByIds(ids: string[]) {
    if (!ids?.length) {
      return []
    }

    try {
      const { data: res } = await this.twitterApi.broadcast.show(ids.filter((v) => v))
      const dbLimiter = new Bottleneck({ maxConcurrent: 1 })
      const broadcasts = await Promise
        .all(Object.entries(res.broadcasts).map(([id, value]) => dbLimiter.schedule(() => this.save(id, value))))
        .then((items) => items.filter((v) => v))
        .then((items) => this.twitterBroadcastService.getManyByIds(items.map((v) => v.id)))

      await Promise.allSettled(broadcasts.map(async (broadcast) => {
        if (!broadcast.playlistUrl) {
          const playlist = await this.fetchPlaylistById(broadcast.id, broadcast.mediaKey)
          Object.assign(broadcast, playlist)
        }
        const user = await this.twitterUserControllerService.getOneByRestId(broadcast.userId, { fromDb: true })
        Object.assign(broadcast, { user })
      }))

      return broadcasts
    } catch (error) {
      this.logger.error(`fetchByIds: ${error.message}`, { ids })
    }
    return []
  }

  public async fetchPlaylistById(id: string, mediaKey: string) {
    if (!id || !mediaKey) {
      return null
    }

    try {
      const liveVideoStreamStatus = await this.twitterGraphqlSpaceService.getLiveVideoStreamStatus(mediaKey)
      const playlistUrl = liveVideoStreamStatus.source.noRedirectPlaybackUrl
      const res = await this.savePlaylist(id, playlistUrl)
      return res
    } catch (error) {
      this.logger.error(`fetchPlaylistById: ${error.message}`, { id, mediaKey })
    }

    return null
  }

  public async save(id: string, data: any) {
    try {
      if (data?.id) {
        const broadcast = TwitterEntityUtil.buildBroadcast(data)
        await this.twitterBroadcastService.save(broadcast)
        return broadcast
      }

      await this.twitterBroadcastService.updateFields(
        id,
        {
          isActive: false,
          updatedAt: Date.now(),
        },
      )
    } catch (error) {
      this.logger.error(`save: ${error.message}`, { data })
    }

    return null
  }

  public async savePlaylist(id: string, playlistUrl: string) {
    if (!id || !playlistUrl) {
      return null
    }

    try {
      const playlistActive = true
      const playlistUpdatedAt = Date.now()
      await this.twitterBroadcastService.updateFields(id, {
        playlistActive,
        playlistUpdatedAt,
        playlistUrl,
      })
      return { playlistActive, playlistUpdatedAt, playlistUrl }
    } catch (error) {
      this.logger.error(`savePlaylist: ${error.message}`, { id })
    }

    return null
  }
}
