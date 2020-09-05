import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DiscordModule } from './modules/discord/discord.module'
import { EnvironmentModule } from './modules/environment/environment.module'

@Module({
  imports: [
    EnvironmentModule,
    DiscordModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
