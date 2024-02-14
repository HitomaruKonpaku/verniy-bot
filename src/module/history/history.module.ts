import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { History } from './model/history.entity'
import { HistoryRepository } from './repository/history.repository'
import { HistoryService } from './service/history.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      History,
    ]),
  ],
  providers: [
    HistoryRepository,
    HistoryService,
  ],
  exports: [
    HistoryService,
  ],
})
export class HistoryModule { }
