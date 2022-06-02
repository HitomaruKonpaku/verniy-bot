import { Inject, Injectable } from '@nestjs/common'
import { InstagramApiResult } from 'instagram-api.js'
import { baseLogger } from '../../../../logger'
import { InstagramPostService } from '../data/instagram-post.service'

@Injectable()
export class InstagramPostControllerService {
  private readonly logger = baseLogger.child({ context: InstagramPostControllerService.name })

  constructor(
    @Inject(InstagramPostService)
    public readonly instagramPostService: InstagramPostService,
  ) { }

  public async getNewPostIds(postIds: string[]) {
    const posts = await this.instagramPostService.getManyByIds(postIds)
    const ids = postIds?.filter?.((postId) => !posts.some((v) => v.id === postId)) || []
    return ids
  }

  public async savePost(data: InstagramApiResult['graphql']['user']['edge_owner_to_timeline_media']['edges'][0]['node']) {
    const post = await this.instagramPostService.save({
      id: data.id,
      isActive: true,
      createdAt: data.taken_at_timestamp,
      userId: data.owner.id,
      shortcode: data.shortcode,
      isVideo: data.is_video,
      displayUrl: data.display_url,
      videoUrl: data.video_url,
    })
    return post
  }
}
