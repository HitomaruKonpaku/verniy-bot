import { Module } from '@nestjs/common'
import { ConfigService } from './service/config.service'

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule { }
