import { NestFactory } from '@nestjs/core'
import Bottleneck from 'bottleneck'
import 'dotenv/config'

import { AppModule } from '../app.module'
import { toggleDebugConsole } from '../logger'
import { TwitterSpaceControllerService } from '../module/twitter/service/controller/twitter-space-controller.service'
import { TwitterSpaceService } from '../module/twitter/service/data/twitter-space.service'

async function bootstrap() {
  toggleDebugConsole()

  const limiter = new Bottleneck({ maxConcurrent: 5 })

  const app = await NestFactory.createApplicationContext(AppModule)
  const twitterSpaceService = app.get(TwitterSpaceService)
  const twitterSpaceControllerService = app.get(TwitterSpaceControllerService)

  const spaces = await twitterSpaceService.repository.find(
    { order: { createdAt: 1 } },
  )

  await Promise.allSettled(spaces.map((space, index) => limiter.schedule(async () => {
    console.debug(index + 1, spaces.length)
    await twitterSpaceControllerService.checkPlaylistStatus(space.id, space.playlistUrl)
  })))
}

bootstrap()
