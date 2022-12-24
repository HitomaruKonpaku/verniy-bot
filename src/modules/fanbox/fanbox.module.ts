import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { EnvironmentModule } from '../environment/environment.module'
import { TrackModule } from '../track/track.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
    ]),
    EnvironmentModule,
    ConfigModule,
    TrackModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
  ],
  exports: [
  ],
})
export class FanboxModule { }
