import { Inject, Injectable } from '@nestjs/common'
import { InstagramApiResult } from 'instagram-api.js'
import { baseLogger } from '../../../../logger'
import { InstagramApiService } from '../api/instagram-api.service'
import { InstagramUserService } from '../data/instagram-user.service'
import { InstagramPostControllerService } from './instagram-post-controller.service'

@Injectable()
export class InstagramUserControllerService {
  private readonly logger = baseLogger.child({ context: InstagramUserControllerService.name })

  constructor(
    @Inject(InstagramUserService)
    public readonly instagramUserService: InstagramUserService,
    @Inject(InstagramPostControllerService)
    public readonly instagramPostControllerService: InstagramPostControllerService,
    @Inject(InstagramApiService)
    private readonly instagramApiService: InstagramApiService,
  ) { }

  public async fetchUserByUsername(username: string) {
    try {
      const result = await this.instagramApiService.getUser(username)
      const user = await this.saveUser(result)
      if (result.edge_owner_to_timeline_media?.edges?.length) {
        const nodes = result.edge_owner_to_timeline_media.edges.map((v) => v.node).filter((v) => v)
        const postIds = nodes.map((v) => v.id)
        const newPostIds = await this.instagramPostControllerService.getNewPostIds(postIds)
        const posts = await Promise.all(nodes.map(async (v) => {
          try {
            const post = await this.instagramPostControllerService.savePost(v)
            return post
          } catch (error) {
            this.logger.error(`fetchUserByUsername#savePost: ${error.message}`, { username, post: v })
          }
          return null
        }))
        user.posts = posts.filter((v) => v) || []
        user.newPosts = user.posts.filter((v) => newPostIds.includes(v.id)) || []
      }
      return user
    } catch (error) {
      this.logger.error(`fetchUserByUsername: ${error.message}`, { username })
    }
    return null
  }

  public async saveUser(data: InstagramApiResult['graphql']['user']) {
    const user = await this.instagramUserService.save({
      id: data.id,
      isActive: true,
      createdAt: 0,
      username: data.username,
      name: data.full_name,
      biography: data.biography,
      isPrivate: data.is_private,
      isVerified: data.is_verified,
      profileImageUrl: data.profile_pic_url_hd || data.profile_pic_url,
      externalUrl: data.external_url,
    })
    user.posts = []
    user.newPosts = []
    return user
  }
}
