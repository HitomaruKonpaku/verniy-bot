import { Module } from '@nestjs/common'
import { EnvironmentService } from './service/environment.service'

@Module({
  providers: [EnvironmentService],
  exports: [EnvironmentService],
})
export class EnvironmentModule { }
