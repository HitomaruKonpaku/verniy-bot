import { NestFactory } from '@nestjs/core'
import 'dotenv/config'

import { AppModule } from '../app.module'
import { toggleDebugConsole } from '../logger'
import { HolodexChannelControllerService } from '../module/holodex/service/controller/holodex-channel-controller.service'

async function bootstrap() {
  toggleDebugConsole()

  const app = await NestFactory.createApplicationContext(AppModule)
  const holodexChannelControllerService = app.get(HolodexChannelControllerService)

  await holodexChannelControllerService.getOrgChannels()

  process.exit()
}

bootstrap()
