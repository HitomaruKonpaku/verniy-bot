import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { ConfigModule } from './modules/config/config.module'
import { DatabaseRootModule } from './modules/database/database-root.module'
import { DiscordModule } from './modules/discord/discord.module'
import { TwitterModule } from './modules/twitter/twitter.module'

@Module({
  imports: [
    ConfigModule,
    DatabaseRootModule,
    DiscordModule,
    TwitterModule,
  ],
  providers: [AppService],
})
export class AppModule { }
