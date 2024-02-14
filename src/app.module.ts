import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { ConfigVarModule } from './module/config-var/config-var.module'
import { ConfigModule } from './module/config/config.module'
import { DatabaseModule } from './module/database/database.module'
import { DiscordModule } from './module/discord/discord.module'
import { EnvironmentModule } from './module/environment/environment.module'
import { HistoryModule } from './module/history/history.module'
import { TrackModule } from './module/track/track.module'
import { VtuberModule } from './module/vtuber/vtuber.module'

@Module({
  imports: [
    EnvironmentModule,
    ConfigModule,
    DatabaseModule,
    ConfigVarModule,
    HistoryModule,
    TrackModule,
    DiscordModule,
    VtuberModule,
  ],
  providers: [AppService],
})
export class AppModule { }
