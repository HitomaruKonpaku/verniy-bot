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
import { InstagramUserControllerService } from './services/controller/instagram-user-controller.service'
import { InstagramPostService } from './services/data/instagram-post.service'
import { InstagramUserService } from './services/data/instagram-user.service'
import { InstagramTrackingService } from './services/instagram-tracking.service'
import { InstagramService } from './services/instagram.service'

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
    InstagramUserControllerService,
    InstagramPostControllerService,
    InstagramTrackingService,
  ],
  exports: [
    InstagramService,
    InstagramApiService,
    InstagramUserService,
    InstagramPostService,
    InstagramUserControllerService,
    InstagramPostControllerService,
  ],
})
export class InstagramModule { }
