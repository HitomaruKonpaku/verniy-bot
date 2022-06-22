import { Inject, Injectable } from '@nestjs/common'
import { XMLParser } from 'fast-xml-parser'
import { baseLogger } from '../../../../logger'
import { TiktokApiService } from '../api/tiktok-api.service'
import { TiktokUserService } from '../data/tiktok-user.service'
import { TiktokVideoControllerService } from './tiktok-video-controller.service'

@Injectable()
export class TiktokUserControllerService {
  private readonly logger = baseLogger.child({ context: TiktokUserControllerService.name })

  constructor(
    @Inject(TiktokUserService)
    public readonly tiktokUserService: TiktokUserService,
    @Inject(TiktokApiService)
    public readonly tiktokApiService: TiktokApiService,
    @Inject(TiktokVideoControllerService)
    public readonly tiktokVideoControllerService: TiktokVideoControllerService,
  ) { }

  public async fetchUser(username: string) {
    try {
      const payload = await this.tiktokApiService.getUserFeed(username)
      if (!payload) {
        return null
      }
      const parser = new XMLParser()
      const userData = parser.parse(payload)?.rss?.channel
      if (!userData) {
        return null
      }
      const user = await this.saveUser(userData)
      const videoData: any[] = (Array.isArray(userData.item) ? userData.item : [userData.item]).filter((v) => v)
      const videoIds: string[] = videoData?.map((v) => v.guid) || []
      if (videoIds.length) {
        try {
          const newVideoIds = await this.tiktokVideoControllerService.getNewVideoIds(videoIds)
          if (newVideoIds.length) {
            const newVideos = videoData.filter((v) => newVideoIds.some((id) => id === v.guid))
            const result = await Promise.allSettled(newVideos.map((v) => this.tiktokVideoControllerService.saveVideo(v, user.id)))
            user.newVideos = result
              .filter((v) => v.status === 'fulfilled')
              .map((v: any) => v.value)
          }
        } catch (error) {
          this.logger.error(`fetchUser#saveVideo: ${error.message}`, { username })
        }
      }
      return user
    } catch (error) {
      if (error.response?.status !== 500) {
        this.logger.error(`fetchUser: ${error.message}`, { username })
      }
    }
    return null
  }

  public async saveUser(data: any) {
    const user = await this.tiktokUserService.save({
      // Not real TikTok user id but since TikTok API so shitty, we just use username as id
      id: data.title.toLowerCase(),
      isActive: true,
      createdAt: 0,
      username: data.title,
      bio: data.description,
    })
    user.videos = []
    return user
  }
}
