import { NestFactory } from '@nestjs/core'
import 'dotenv/config'
import { AppModule } from './app.module'
import { AppService } from './app.service'
import { logger } from './logger'

async function bootstrap() {
  logger.info(Array(50).fill('=').join(''))
  // process.env.NO_COLOR = '1'
  const app = await NestFactory.createApplicationContext(AppModule)
  const appService = app.get(AppService)
  await appService.start()
}

bootstrap()
