import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { EnvironmentModule } from '../environment/environment.module'
import { TrackModule } from '../track/track.module'
import { InstagramPost } from './model/instagram-post.entity'
import { InstagramStory } from './model/instagram-story.entity'
import { InstagramUser } from './model/instagram-user.entity'
import { InstagramApiService } from './service/api/instagram-api.service'
import { InstagramPostControllerService } from './service/controller/instagram-post-controller.service'
import { InstagramStoryControllerService } from './service/controller/instagram-story-controller.service'
import { InstagramUserControllerService } from './service/controller/instagram-user-controller.service'
import { InstagramPostService } from './service/data/instagram-post.service'
import { InstagramStoryService } from './service/data/instagram-story.service'
import { InstagramUserService } from './service/data/instagram-user.service'
import { InstagramService } from './service/instagram.service'
import { InstagramPostTrackingService } from './service/tracking/instagram-post-tracking.service'
import { InstagramProfileTrackingService } from './service/tracking/instagram-profile-tracking.service'
import { InstagramStoryTrackingService } from './service/tracking/instagram-story-tracking.service'
import { InstagramTrackingService } from './service/tracking/instagram-tracking.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstagramUser,
      InstagramPost,
      InstagramStory,
    ]),
    EnvironmentModule,
    ConfigModule,
    TrackModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    InstagramService,
    InstagramApiService,
    InstagramUserService,
    InstagramPostService,
    InstagramStoryService,
    InstagramUserControllerService,
    InstagramPostControllerService,
    InstagramStoryControllerService,
    InstagramTrackingService,
    InstagramPostTrackingService,
    InstagramStoryTrackingService,
    InstagramProfileTrackingService,
  ],
  exports: [
    InstagramService,
    InstagramApiService,
    InstagramUserService,
    InstagramPostService,
    InstagramStoryService,
    InstagramUserControllerService,
    InstagramPostControllerService,
    InstagramStoryControllerService,
  ],
})
export class InstagramModule { }
