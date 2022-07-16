import { Module } from '@nestjs/common'
import { ConfigModule } from '../config/config.module'
import { TrackModule } from '../track/track.module'
import { TwitterModule } from '../twitter/twitter.module'
import { HolodexApiService } from './services/api/holodex-api.service'
import { HolodexService } from './services/holodex.service'

@Module({
  imports: [
    ConfigModule,
    TrackModule,
    TwitterModule,
  ],
  providers: [
    HolodexService,
    HolodexApiService,
  ],
  exports: [
    HolodexService,
    HolodexApiService,
  ],
})
export class HolodexModule { }
