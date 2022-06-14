import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { InstagramPost } from './models/instagram-post.entity'
import { InstagramStory } from './models/instagram-story.entity'
import { InstagramUser } from './models/instagram-user.entity'
import { InstagramApiService } from './services/api/instagram-api.service'
import { InstagramPostControllerService } from './services/controller/instagram-post-controller.service'
import { InstagramStoryControllerService } from './services/controller/instagram-story-controller.service'
import { InstagramUserControllerService } from './services/controller/instagram-user-controller.service'
import { InstagramPostService } from './services/data/instagram-post.service'
import { InstagramStoryService } from './services/data/instagram-story.service'
import { InstagramUserService } from './services/data/instagram-user.service'
import { InstagramService } from './services/instagram.service'
import { InstagramPostTrackingService } from './services/tracking/instagram-post-tracking.service'
import { InstagramProfileTrackingService } from './services/tracking/instagram-profile-tracking.service'
import { InstagramTrackingService } from './services/tracking/instagram-tracking.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstagramUser,
      InstagramPost,
      InstagramStory,
    ]),
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
