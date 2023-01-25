import { Module } from '@nestjs/common'
import { ConfigModule } from '../config/config.module'
import { TrackModule } from '../track/track.module'
import { TwitterModule } from '../twitter/twitter.module'
import { HolodexApiService } from './service/api/holodex-api.service'
import { HolodexService } from './service/holodex.service'

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
