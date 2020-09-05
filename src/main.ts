import { NestFactory } from '@nestjs/core'
import { AppLogger } from './app.logger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    { logger: new AppLogger() },
  )

  await app.listen(3000)
}

bootstrap()
