import { Module } from '@nestjs/common'
import { ConfigModule } from '../config/config.module'
import { TrackModule } from '../track/track.module'
import { TwitterModule } from '../twitter/twitter.module'
import { HolodexService } from './services/holodex.service'

@Module({
  imports: [
    ConfigModule,
    TrackModule,
    TwitterModule,
  ],
  providers: [
    HolodexService,
  ],
  exports: [
    HolodexService,
  ],
})
export class HolodexModule { }
