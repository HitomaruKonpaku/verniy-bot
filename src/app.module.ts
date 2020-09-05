import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DiscordModule } from './modules/discord/discord.module'
import { EnvironmentModule } from './modules/environment/environment.module'
import { TwitterModule } from './modules/twitter/twitter.module'

@Module({
  imports: [
    EnvironmentModule,
    DiscordModule,
    TwitterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
