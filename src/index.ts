import { NestFactory } from '@nestjs/core'
import 'dotenv/config'
import { AppModule } from './app.module'
import { AppService } from './app.service'

async function bootstrap() {
  // process.env.NO_COLOR = '1'
  const app = await NestFactory.createApplicationContext(AppModule)
  const appService = app.get(AppService)
  await appService.start()
}

bootstrap()
