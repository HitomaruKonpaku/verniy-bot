import { Module } from '@nestjs/common'
import { ConfigService } from './services/config.service'

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule { }
