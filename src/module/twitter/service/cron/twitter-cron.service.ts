import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { TwitterSpaceCronService } from './twitter-space-cron.service'
import { TwitterSpacePlaylistCronService } from './twitter-space-playlist-cron.service'
import { TwitterTweetCronService } from './twitter-tweet-cron.service'
import { TwitterUserCronService } from './twitter-user-cron.service'

@Injectable()
export class TwitterCronService {
  private readonly logger = baseLogger.child({ context: TwitterCronService.name })

  constructor(
    @Inject(TwitterUserCronService)
    private readonly twitterUserCronService: TwitterUserCronService,
    @Inject(TwitterSpaceCronService)
    private readonly twitterSpaceCronService: TwitterSpaceCronService,
    @Inject(TwitterSpacePlaylistCronService)
    private readonly twitterSpacePlaylistCronService: TwitterSpacePlaylistCronService,
    @Inject(TwitterTweetCronService)
    private readonly twitterTweetCronService: TwitterTweetCronService,
  ) { }

  public start() {
    this.logger.info('Starting...')
    this.twitterUserCronService.start()
    this.twitterSpaceCronService.start()
    this.twitterSpacePlaylistCronService.start()
    this.twitterTweetCronService.start()
  }
}
