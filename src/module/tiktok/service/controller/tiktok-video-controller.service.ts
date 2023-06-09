import { Inject, Injectable } from '@nestjs/common'
import * as cheerio from 'cheerio'
import { baseLogger } from '../../../../logger'
import { TiktokUser } from '../../model/tiktok-user.entity'
import { TiktokVideo } from '../../model/tiktok-video.entity'
import { TiktokApiService } from '../api/tiktok-api.service'
import { TiktokVideoService } from '../data/tiktok-video.service'

@Injectable()
export class TiktokVideoControllerService {
  private readonly logger = baseLogger.child({ context: TiktokVideoControllerService.name })

  constructor(
    @Inject(TiktokVideoService)
    public readonly tiktokVideoService: TiktokVideoService,
    @Inject(TiktokApiService)
    public readonly tiktokApiService: TiktokApiService,
  ) { }

  public async getNewVideoIds(videoIds: string[]) {
    try {
      const videos = await this.tiktokVideoService.getManyByIds(videoIds)
      const newVideoIds = videoIds.filter((id) => !videos.some((v) => v.id === id))
      return newVideoIds
    } catch (error) {
      this.logger.error(`getNewVideoIds: ${error.message}`, { videoIds })
    }
    return []
  }

  public async saveNewVideos(data: any, user: Pick<TiktokUser, 'id' | 'username'>) {
    try {
      const items = [data].flat().filter((v) => v) || []
      const videoIds = items.map((v) => v.guid).filter((v) => v)
      if (!videoIds.length) {
        return []
      }
      const newVideoIds = await this.getNewVideoIds(videoIds)
      if (!newVideoIds.length) {
        return []
      }
      const newItems = items.filter((v) => newVideoIds.some((id) => id === v.guid))
      const result = await Promise.allSettled(newItems.map((v) => this.saveVideo(v, user.id)))
      const videos: TiktokVideo[] = result
        .filter((v) => v.status === 'fulfilled')
        .map((v: any) => v.value)
      return videos
    } catch (error) {
      this.logger.error(`saveNewVideos: ${error.message}`, { username: user.username })
    }
    return []
  }

  public async saveVideo(data: any, userId: string) {
    const video = await this.tiktokVideoService.save({
      id: data.guid,
      isActive: true,
      createdAt: Math.floor(new Date(data.pubDate).getTime() / 1000),
      userId,
      description: data.title || data.description,
    })
    video.src = this.parseVideoSrc(data)
    return video
  }

  public parseVideoSrc(data: any) {
    try {
      const $ = cheerio.load(data?.description || '')
      const selector = 'video source'
      const src = $(selector).attr('src')
      if (!src) {
        return null
      }
      return src
    } catch (error) {
      this.logger.error(`parseVideoSrc: ${error.message}`, { data })
    }
    return null
  }
}
