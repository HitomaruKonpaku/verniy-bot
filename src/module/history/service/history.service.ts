import { Inject, Injectable } from '@nestjs/common'
import { History } from '../model/history.entity'
import { HistoryRepository } from '../repository/history.repository'

@Injectable()
export class HistoryService {
  constructor(
    @Inject(HistoryRepository)
    private readonly historyRepository: HistoryRepository,
  ) { }

  public async save(data: Omit<History, 'id' | 'isActive' | 'createdAt'>) {
    const result = await this.historyRepository.save(data)
    return result
  }
}
