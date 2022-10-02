import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { ConfigModule } from './modules/config/config.module'
import { DatabaseModule } from './modules/database/database.module'
import { DiscordModule } from './modules/discord/discord.module'
import { EnvironmentModule } from './modules/environment/environment.module'
import { TrackModule } from './modules/track/track.module'

@Module({
  imports: [
    EnvironmentModule,
    ConfigModule,
    DatabaseModule,
    TrackModule,
    DiscordModule,
  ],
  providers: [AppService],
})
export class AppModule { }
