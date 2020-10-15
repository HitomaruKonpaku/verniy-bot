import { Module } from '@nestjs/common'
import { EnvironmentModule } from '../environment/environment.module'
import { TwitterDataService } from './services/twitter-data.service'
import { TwitterEventService } from './services/twitter-event.service'
import { TwitterService } from './services/twitter.service'

@Module({
  imports: [EnvironmentModule],
  providers: [
    TwitterService,
    TwitterEventService,
    TwitterDataService,
  ],
  exports: [TwitterService],
})
export class TwitterModule { }
