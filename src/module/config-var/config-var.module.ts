import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigVar } from './model/config-var.entity'
import { ConfigVarService } from './service/config-var.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConfigVar,
    ]),
  ],
  providers: [
    ConfigVarService,
  ],
  exports: [
    ConfigVarService,
  ],
})
export class ConfigVarModule { }
