import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { InstagramApiService } from '../api/instagram-api.service'
import { InstagramStoryService } from '../data/instagram-story.service'

@Injectable()
export class InstagramStoryControllerService {
  private readonly logger = baseLogger.child({ context: InstagramStoryControllerService.name })

  constructor(
    @Inject(InstagramStoryService)
    public readonly instagramStoryService: InstagramStoryService,
    @Inject(InstagramApiService)
    public readonly instagramApiService: InstagramApiService,
  ) { }

  public async getNewUserStories(userId: string, username?: string) {
    try {
      const response = await this.instagramApiService.getUserStories(userId, username)
      const items: any[] = response?.items || []
      if (!items.length) {
        return []
      }
      const ids: string[] = items.map((v) => v.pk).filter((v) => v)
      const oldStories = await this.instagramStoryService.getManyByIds(ids)
      const newIds = ids.filter((id) => !oldStories.some((story) => story.id === id))
      if (!newIds.length) {
        return []
      }
      const newItems = items.filter((v) => newIds.includes(v.pk))
      const newStories = await Promise.all(newItems.map((v) => this.saveStory(v)))
      return newStories
    } catch (error) {
      this.logger.error(`getNewUserStories: ${error.message}`, { username, userId })
    }
    return []
  }

  public async saveStory(data: any) {
    const story = await this.instagramStoryService.save({
      id: String(data.pk),
      isActive: true,
      createdAt: data.taken_at,
      userId: String(data.user.pk),
      expiringAt: data.expiring_at,
      code: data.code,
      originalWidth: data.original_width,
      originalHeight: data.original_height,
      imageUrl: data.image_versions2?.candidates?.[0]?.url,
    })

    story.videoUrls = []
    if (data.video_versions?.length) {
      story.videoUrls = data.video_versions
        .map((v) => v?.url)
        .filter((v) => v)
    }

    return story
  }
}
