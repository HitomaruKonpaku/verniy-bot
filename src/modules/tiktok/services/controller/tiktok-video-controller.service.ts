import { Inject, Injectable } from '@nestjs/common'
import * as cheerio from 'cheerio'
import { baseLogger } from '../../../../logger'
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

  public async saveVideo(data: any, userId: string) {
    const video = await this.tiktokVideoService.save({
      id: data.guid,
      isActive: true,
      createdAt: Math.floor(new Date(data.pubDate).getTime() / 1000),
      userId,
      description: data.title || data.description || null,
    })
    video.src = this.parseVideoSrc(data)
    return video
  }

  public parseVideoSrc(data: any) {
    try {
      const $ = cheerio.load(data?.description)
      const src = $('video')?.[0]?.attribs?.src
      return src
    } catch (error) {
      this.logger.error(`parseVideoSrc: ${error.message}`, { data })
    }
    return null
  }
}
