import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import Innertube from 'youtubei.js'
import { BackstagePost, Post, SharedPost } from 'youtubei.js/dist/src/parser/nodes'
import { ChannelListContinuation } from 'youtubei.js/dist/src/parser/youtube'
import { baseLogger } from '../../../../logger'
import { buildAuthHeaders } from '../../../masterchat/auth'
import { Credentials } from '../../../masterchat/interfaces'
import { YoutubePost } from '../../model/youtube-post.entity'
import { YoutubeEntityUtil } from '../../util/youtube-entity.util'
import { YoutubePostService } from '../data/youtube-post.service'

interface SaveOptions {
  withLimiter?: boolean
}

interface FetchOptions extends SaveOptions {
  withContinuation?: boolean
}

@Injectable()
export class YoutubePostControllerService implements OnModuleInit {
  protected readonly logger = baseLogger.child({ context: YoutubePostControllerService.name })

  private youtube: Innertube

  constructor(
    @Inject(YoutubePostService)
    private readonly youtubePostService: YoutubePostService,
  ) { }

  async onModuleInit() {
    this.youtube = await this.getInnertube()
  }

  public async fetchFromChannel(channelId: string, options?: FetchOptions) {
    const youtube = this.youtube || await this.getInnertube()
    const channel = await youtube.getChannel(channelId)
    if (!channel.has_community) {
      return []
    }

    const community = await channel.getCommunity()
    const tmpPosts = community.posts

    if (options?.withContinuation) {
      let tmpContinuation: ChannelListContinuation = community
      while (tmpContinuation.has_continuation) {
        // eslint-disable-next-line no-await-in-loop
        tmpContinuation = await tmpContinuation.getContinuation()
        tmpPosts.push(...tmpContinuation.posts)
      }
    }

    tmpPosts.reverse()

    const posts = await this.savePosts(tmpPosts, channelId, { withLimiter: true, ...options })
    return posts
  }

  public async savePosts(data: (BackstagePost | Post | SharedPost)[], channelId: string, options?: SaveOptions) {
    const posts: YoutubePost[] = []
    const backstagePosts = data.filter((v): v is BackstagePost => v.type === 'BackstagePost')
    if (options?.withLimiter) {
      const limiter = new Bottleneck({ maxConcurrent: 1 })
      const items = await Promise.all(backstagePosts.map((v) => limiter.schedule(() => this.saveBackstagePost(v, channelId))))
      posts.push(...items)
    } else {
      const tmpPosts = backstagePosts.map((v) => YoutubeEntityUtil.buildPostFromBackstagePost(v, channelId))
      const items = await this.youtubePostService.saveAll(tmpPosts)
      posts.push(...items)
    }
    return posts
  }

  public async saveBackstagePost(data: BackstagePost, channelId: string) {
    const post = await this.youtubePostService.save(YoutubeEntityUtil.buildPostFromBackstagePost(data, channelId))
    return post
  }

  // eslint-disable-next-line class-methods-use-this
  private async getInnertube() {
    const credentials: Credentials = {
      SAPISID: process.env.YOUTUBE_SAPISID,
      APISID: process.env.YOUTUBE_APISID,
      HSID: process.env.YOUTUBE_HSID,
      SSID: process.env.YOUTUBE_SSID,
      SID: process.env.YOUTUBE_SID,
    }

    const youtube = await Innertube.create({
      fetch: async (input: any, init) => {
        const method = input.method || 'GET'
        const url = (input.url || input).toString()

        // eslint-disable-next-line prefer-const
        let headers = init?.headers as any
        if (headers && method === 'POST') {
          headers = buildAuthHeaders(credentials)
        }

        const res = await fetch(url, { ...init, method, headers })
        return res
      },
    })

    return youtube
  }
}
