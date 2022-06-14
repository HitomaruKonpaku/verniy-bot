import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { YoutubeChannel } from './models/youtube-channel.entity'
import { YoutubeVideo } from './models/youtube-video.entity'
import { YoutubeService } from './services/youtube.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      YoutubeChannel,
      YoutubeVideo,
    ]),
    ConfigModule,
    TrackModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    YoutubeService,
  ],
  exports: [
    YoutubeService,
  ],
})
export class YoutubeModule { }
