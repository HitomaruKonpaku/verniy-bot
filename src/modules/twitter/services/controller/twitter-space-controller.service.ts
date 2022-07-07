import { Inject, Injectable } from '@nestjs/common'
import { SpaceV2 } from 'twitter-api-v2'
import { baseLogger } from '../../../../logger'
import { SpaceState } from '../../enums/twitter-space.enum'
import { TwitterEntityUtils } from '../../utils/twitter-entity.utils'
import { TwitterApiPublicService } from '../api/twitter-api-public.service'
import { TwitterApiService } from '../api/twitter-api.service'
import { TwitterSpaceService } from '../data/twitter-space.service'
import { TwitterUserControllerService } from './twitter-user-controller.service'

@Injectable()
export class TwitterSpaceControllerService {
  private readonly logger = baseLogger.child({ context: TwitterSpaceControllerService.name })

  constructor(
    @Inject(TwitterSpaceService)
    private readonly twitterSpaceService: TwitterSpaceService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
    @Inject(TwitterApiPublicService)
    private readonly twitterApiPublicService: TwitterApiPublicService,
  ) { }

  public async getOneById(id: string, refresh = false) {
    let space = !refresh
      ? await this.twitterSpaceService.getOneById(id)
      : null
    if (!space) {
      const result = await this.twitterApiService.getSpaceById(id)
      space = TwitterEntityUtils.buildSpace(result.data)
      // Try to get playlist url
      if ([SpaceState.LIVE, SpaceState.ENDED].includes(space.state)) {
        try {
          space.playlistUrl = await this.twitterApiPublicService.getSpacePlaylistUrl(id)
          if (space.playlistUrl) {
            space.playlistActive = true
          }
        } catch (error) {
          this.logger.error(`getOneById#getSpacePlaylistUrl: ${error.message}`, { id })
        }
      }
      // Save
      await this.twitterSpaceService.save(space)
      // Try to get creator
      try {
        await this.twitterUserControllerService.getOneById(space.creatorId)
      } catch (error) {
        this.logger.error(`getOneById#getUserById: ${error.message}`, { id })
      }
    }
    return space
  }

  public async saveSpace(data: SpaceV2) {
    const space = await this.twitterSpaceService.save(TwitterEntityUtils.buildSpace(data))
    return space
  }
}
