import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { ConfigModule } from './module/config/config.module'
import { DatabaseModule } from './module/database/database.module'
import { DiscordModule } from './module/discord/discord.module'
import { EnvironmentModule } from './module/environment/environment.module'
import { TrackModule } from './module/track/track.module'
import { VtuberModule } from './module/vtuber/vtuber.module'

@Module({
  imports: [
    EnvironmentModule,
    ConfigModule,
    DatabaseModule,
    TrackModule,
    DiscordModule,
    VtuberModule,
  ],
  providers: [AppService],
})
export class AppModule { }
